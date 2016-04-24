var name = 'lunch'
var itemDescription = 'Lunchstripe'
var tegneserieLink = 'http://lunchstriper.no/'
var tegneserieLogo = 'http://lunchstriper.no/assets/graphics/logo.png'
var url = 'http://www.dagbladet.no/tegneserie/lunch/'
var Entry = require('../../models/comic-entry.js');
var request = require('request');
var cheerio = require('cheerio');
var generateFeed = require('../../utils/generateFeed');


exports.init = function(hour, minute) {
  setupCronjob(hour, minute);
  fetch();
}

function setupCronjob(hour, minute) {
  var cronTime = process.env.CRON_TIME || '00 '+minute+' '+hour+' * * 1-7';
  var timeZone = process.env.TIME_ZONE || 'Europe/Oslo';
  var CronJob = require('cron').CronJob;
  var job =  new CronJob({
    cronTime: cronTime,
    onTick: fetch,
    start: true,
    timeZone: timeZone
  });
}

function fetch() {
  request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var imageSrc = $('img.tegneserie').attr('src')
      request(imageSrc, function (error, res, body) {
        if (!error) {
          var promise = Entry.where("url").equals(res.request.href).exec();
          promise.then(function(entries) {
            if(entries.length == 0 ) {
              var newEntry = new Entry({url:res.request.href, label:name})
              newEntry.save(function (err, userObj) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('saved successfully:', userObj);
                }
              });
            }
          })
        }
      })
    } else {
      console.log("We’ve encountered an error: " + error);
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
