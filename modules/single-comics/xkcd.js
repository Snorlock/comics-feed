var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../../utils/generateFeed');
var fetchUtil = require('../../utils/fetch');
var cronjob = require('../../utils/cronjob');
var xml2js = require('xml2js');
var Slack = require('slack-node');
var apiToken = process.env.XKCD_BOT_TOKEN;
var slack = new Slack(apiToken);

var name = 'xkcd'
var itemDescription = 'Xkcd'
var tegneserieLink = 'http://xkcd.com'
var tegneserieLogo = 'http://imgs.xkcd.com/static/terrible_small_logo.png'
var rssUrl = 'http://xkcd.com/rss.xml'

exports.init = function(hour, minute) {
  cronjob(hour, minute, fetch);
  fetch();
}

function fetch() {
  request(rssUrl, function (error, response, xmlBody) {
    if (!error) {
      xml2js.parseString(xmlBody, function (err, result) {
        var url = result.rss.channel[0].item[0].link[0];
        $1 = cheerio.load(result.rss.channel[0].item[0].description[0])
        var title = $1("img").attr("title")
        request(url, function (error, response, body) {
          if (!error) {
            var $ = cheerio.load(body);
            var imageSrc = "http://"+$('#comic img').attr('src').substring(2);
            fetchUtil.fetchAndSaveImage(imageSrc, name, {
              callback: getExplanationAndSendMessageToSlack.bind(this, $, url, title)
            });
          } else {
            console.log("We’ve encountered an error: " + error);
          }
        });
      });
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });
}

function getExplanationAndSendMessageToSlack($, url, title, imageUrl) {
  var comicId = url.split("/")[3];
  var explanationUrl = "http://www.explainxkcd.com/wiki/index.php/"+comicId;
  var fallback = url+" "+explanationUrl+comicId
  var attachments = [{
    "fallback": fallback,
    "color": "#36a64f",
    "title": title,
    "image_url": imageUrl,
    "pretext": explanationUrl
  }]
  slack.api('chat.postMessage', {
    text:'*XKCD with explanation*',
    channel:process.env.SLACK_CHANNEL,
    attachments: JSON.stringify(attachments),
    as_user: true
  }, function(err, response){
    if(err) {
      console.log(err);
    }
    if(!response.ok) {
      console.log(response);
    }
  });
}

exports.routeFunction = function (req, res) {
  const obj = generateFeed(name, itemDescription, tegneserieLink, tegneserieLogo)
  obj.then(function(feed){
    res.set('Content-Type', 'text/xml');
    res.send(feed);
  })
};
