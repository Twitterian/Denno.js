var logger = require('./../logger.js');
var AppInfo;
var Tweets = [];
var Random = require('random-js');
var mt = Random.engines.mt19937();
mt.autoSeed();

module.exports = function Run(dir) {
    logger("! Tweak 'Regular-Tweets' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var line = require('fs-sync').read(dir + '/tweets.txt', 'utf8').split('\n');
    for (var i = 0; i < line.length; i++) {
        logger('\t'+i+' : ' + line[i].substr(0, 40) + ' ...'); // cut string (too long. he rape my logs)
        Tweets.push(line[i].replace(/<br>/gi, '\n'));
    }
    if (Tweets.length > 0) {
        return Main;
    }
}

function Main(client) {
    var r = Random.integer(0, Tweets.length-1)(mt);
    client.post('statuses/update', {
        status: Tweets[r]
    }, function (error, tweet, response) {
        if (error)  console.error(error);
        else {
            logger('Tweet published : ' + tweet.user.screen_name + ' ［ ' + tweet.text.replace(/\n/gi, '<br>') + ' ]' + ' ...');
        }
        setTimeout(function () { Main(client); }, Number(AppInfo.get('Duration')) + Random.integer(-Number(AppInfo.get('Tolerance')), Number(AppInfo.get('Tolerance')))(mt));
    });
}