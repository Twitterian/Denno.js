var logger = require('./../logger.js');
var AppInfo;
var Random = require('random-js');
var mt = Random.engines.mt19937();
mt.autoSeed();


module.exports = function Run(dir, client, owners) {
    logger("! Tweak 'Timeline-ReAction' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var Category = [];
    var input = [];
    var output = [];
    var line = require('fs-sync').read(dir + '/strings', 'utf8').split('\n');
    for (var i = 0; i < line.length; i++) {
        line[i] = line[i].trim(); // remove blank
        var item = line[i].split('='); // split line to item1=item2=item3

        Category.push(item[0]);
        input.push(new RegExp(item[1].replace(/ /g, ''), 'i'));
        output.push(item[2]);

        logger("\t" + i + ' : (' + Category[i] + ') '+ input[i] + ' > ' + output[i]);
    }

    return function (tweet, user) {
        if (owners.indexOf(tweet.user.id_str) == -1) { // is owner's tweet
            var outputs = [];
            for (var i = 0; i < input.length; i++) {

                if (input[i].test(tweet.text.replace(/ /g, ''))) { // remove space
                    if  (Category[i] == "All" ||
                        (Category[i] == "Mention" && tweet.in_reply_to_user_id_str == user.id_str) ||
                        (Category[i] == "Public" && tweet.in_reply_to_status_id == undefined)) //Category Parse
                    {
                        outputs.push(i);
                    }
                }
            }

            if (outputs.length > 0) {
                var r = Random.integer(0, outputs.length - 1)(mt);
                client.post('statuses/update', {
                    in_reply_to_status_id: tweet.id_str,
                    status:
                    '@' + tweet.user.screen_name + ' ' + output[outputs[r]]
                }, function (error, rtweet, response) {
                    if (error) {
                        logger('TLR Failed [ @' + tweet.user.screen_name + ' : ' + tweet.text.replace(/\n/gi, '<br>') + ' > '+ output[outputs[r]]);
                        console.error(error);
                    }
                    else {
                        logger('TLR [ @' + tweet.user.screen_name + ' : ' + tweet.text.replace(/\n/gi, '<br>') + ' > ' + rtweet.text.replace(/\n/gi, '<br>') + ' ]');
                    }
                });
            }
         }
    };
}