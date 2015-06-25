var AppInfo;
var Random = require('random-js');
var mt = Random.engines.mt19937();
mt.autoSeed();

module.exports = function Run(dir, owners) {
    console.log("! Tweak 'Remote-Exit' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);
    var regex = new RegExp(AppInfo.get('keyword'), 'i');

    return function(tweet){
        if (owners.indexOf(tweet.user.id_str) != -1) { // is owner's tweet
            if (regex.test(tweet.text)) {
                console.log('! App terminated from Remote-host @' + tweet.user.screen_name);
                process.exit();
            }
        }
    };
}