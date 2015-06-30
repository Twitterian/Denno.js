var logger = require('./../logger.js');
var AppInfo;
var Random = require('random-js');
var mt = Random.engines.mt19937();
mt.autoSeed();

module.exports = function Run(dir, owners) {
    logger("! Tweak 'Remote-Exit' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var exitreg = new RegExp(AppInfo.get('exit_keyword'), 'i');
    var starttreg = new RegExp(AppInfo.get('start_keyword'), 'i');

    return function(tweet, nowrun){
        if (owners.indexOf(tweet.user.id_str) != -1) { // is owner's tweet
            if (exitreg.test(tweet.text)) {
                logger('! App terminated from Remote-host @' + tweet.user.screen_name);
                nowrun = false;
            }
            else if (starttreg.test(tweet.text)) {
                logger('! App started from Remote-host @' + tweet.user.screen_name);
                nowrun = true;
            }
        }
        return nowrun;
    };
}