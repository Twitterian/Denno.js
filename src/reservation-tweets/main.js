var AppInfo;
var Random = require('random-js');
var mt = Random.engines.mt19937();
mt.autoSeed();

module.exports = function Run(dir, client) {
    console.log("\tTweak 'Reservation-Tweets' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var Owners = [];
    var line = require('fs-sync').read(dir + '/../owners.id_str', 'utf8').split('\r\n');
    for (var i = 0; i < line.length; i++) {
        console.log('\t\t' + i + ' : ' + line[i]);
        Owners.push(line[i]);
    }

    var RegStrs = [];
    var line = require('fs-sync').read(dir + '/strings', 'utf8').split('\r\n');
    for (var i = 0; i < line.length; i++) {
        RegStrs.push(new RegExp(line[i].replace(/ /g, ''), 'i'));
        console.log('\t\t' + i + ' : ' + RegStrs[i]);
    }

    client.stream('user', { replies: 'all' }, function (stream) {
        stream.on('data', function (tweet) {
            if (tweet.user.id_str != undefined && tweet.retweeted_status == undefined) {
                if (Owners.indexOf(tweet.user.id_str) > 0) { // is owner's tweet
                    for (var i = 0; i < RegStrs.length; i++) {
                        if (RegStrs[i].test(tweet.text.replace(/ /g, ''))) {
                            
                            client.post('statuses/update', {
                                in_reply_to_status_id: tweet.id_str,
                                status:
                                    '@' + tweet.user.screen_name + '\n' + GetGisukString()
                            }, function (error, tweet, response) { if (error) console.error(error); });
                            break;
                        }
                    }
                }
            }
        });

        stream.on('error', function (error) {
            console.error(error);
        });
    });
}