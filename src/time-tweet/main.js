var logger = require('./../logger.js');
var AppInfo;
var CronJob = require('cron').CronJob;

var output = [];
module.exports = function Run(dir, client, owners) {
    logger("! Tweak 'Time-Tweet' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var time = [];
    var line = require('fs-sync').read(dir + '/tweets', 'utf8').split('\n');
    for (var i = 0; i < line.length; i++) {
        line[i] = line[i].trim(); // remove blank
        var item = line[i].split('='); // split line to item1=item2=item3
        time.push(item[0]);
        output.push(item[1]);
        logger("\t" + i + ' : (' + time[i] + ') ' + output[i]);
    }

    return function () {
        for (var i = 0; i < line.length; i++) {
            CreateCronJob(client, time[i], output[i]);
        }
    };
}


function CreateCronJob(client, time, text)
{
    new CronJob(time, function () {
        client.post('statuses/update', {
            status: text
        }, function (error, rtweet, response) {
            if (error) {
                logger('Time tweet cant published : ' + text);
                console.error(error);
            }
            else {
                logger('Time tweet published : ' + text);
            }
        });
    }, null, true, "Asia/Seoul");
}