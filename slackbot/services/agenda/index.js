import { Teams } from '../../repository/'
import Agenda from './agenda'
import { postToChannelWithTeamId } from '../posting'
const logger = require('../../../utils/logger');

export const initAgendaForAllTeams = async () => {
  const teams = await Teams.find({})
  if(teams.length < 1) {
    logger.log('info', 'No teams to init agenda posting for')
  }
  else {
    teams.forEach(function(team) {
      if(team.active) {
        Agenda.initAgendaForTeam(team, postToChannelWithTeamId)
        logger.log('info', `Server just started, so trying to post to ${team.team_name} in channel ${team.incoming_webhook.channel}`)
        postToChannelWithTeamId(team.team_id, team.incoming_webhook.channel_id)
      }
    });
  }
}
