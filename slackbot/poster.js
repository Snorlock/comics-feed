const Team = require('./models/slack-teams');
const Entry = require('../models/comic-entry.js');
const WebClient = require('@slack/client').WebClient;
const IncomingWebhook = require('@slack/client').IncomingWebhook;
const comics = require('../comics');
const Agenda = require('./utils/agenda');
const moment = require('moment');
const logger = require('../utils/logger');

const postToTeamWithId = (team_id, channel_id) => {
    console.log("POSTING EVERY "+process.env.CHECK_INTERVAL+" with id: "+team_id+" and channel_id: "+channel_id)
    const team_query = { team_id: team_id, "incoming_webhook.channel_id": channel_id }
    const promise = Team.find(team_query).exec();
    promise.then(function(teams) {
        let update = false;
        const team = teams[teams.length-1]
        const subscriptions = team.subscriptions;
        const webhook = team.incoming_webhook.url
        const tempSubs = [...subscriptions];

        while(tempSubs.length != 0) {
            const subscription = tempSubs.pop();
            fetchEntries(subscription).then((entries) => {
                const entry = entries[0];
                if(
                    !subscription.lastUrlPublished ||
                    (subscription.lastUrlPublished !== entry.url && isTimeToPost(subscription))
                ) {
                    postWebhookToSlack(entry, webhook, team.incoming_webhook.channel_id)
                    subscription.lastUrlPublished = entry.url;
                    subscription.datePublished = moment().format('x')
                    update = true;
                }
                if(update && tempSubs.length == 0) {
                    var query = { team_id: team.team_id, "incoming_webhook.channel_id": team.incoming_webhook.channel_id };
                    Team.update(query, { subscriptions: subscriptions }, (err, raw)=> {
                        if (err) logger.log('error' `Team subscription update error: ${err}`)
                    })
                }
            })
        }
    });
}

const isTimeToPost = (subscription) => {
    const now = moment().tz(subscription.postTime.timeZone);
    console.log(`The time now is ${now} and postTime is ${subscription.postTime.hour}. Is this within the intevall? ${now.hour() >= subscription.postTime.hour <= now.hour()+4} `)
    return now.hour() >= subscription.postTime.hour <= now.hour()+4 && now.minute() >= subscription.postTime.minute
}

const initAgendaForTeam = (team) => {
    const team_id = team.team_id;
    const channel_id = team.channel_id || team.incoming_webhook.channel_id;
    Agenda.defineTeamPosting(team_id, channel_id, postToTeamWithId);
    logger.log('info', `Server just started, so posting to ${team.team_name} in channel ${team.incoming_webhook.channel}`)
    postToTeamWithId(team.team_id, team.incoming_webhook.channel_id)
}

const fetchEntries = (subscription) => {
    return Entry.find({label:subscription.name}).sort('-date').limit(1).exec();
}

const postWebhookToSlack = (entry, webhook, channel) => {
    const hook = new IncomingWebhook(webhook);
    const comicAttachment = createAttachments(entry);
    hook.send({attachments: comicAttachment}, function(err, res) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Message sent: '+entry.url);
        }
    });
}

const createAttachments = (entry) => {
    const comic = comics.available.find(comic=> {
            return comic.name === entry.label
    })
    const name = uppercaseFirst(comic.name)
    return [
            {
                "fallback": entry.url,
                "color": "#36a64f",
                "author_name": name,
                "author_link": comic.tegneserieSideLink,
                "author_icon": comic.tegneserieLogo,
                "title": `Dagens ${name}`,
                "title_link": comic.stripUrl,
                "image_url": entry.url,
                "footer": comic.mediator || '',
                "footer_icon": comic.mediatorLogo || ''
            }
        ]
}

const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    postToTeamWithId,
    initAgendaForTeam
}
