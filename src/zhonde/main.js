var AppInfo;


module.exports = function Run(dir, client, owners) {
    console.log("! Tweak 'Timeline-ReAction' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var banmo = [];
    client.get('lists/members', {}, function (error, user, response) {

    });

    return function (tweet) {
        if (tweet.in_reply_to_status_id == undefined) {
            if (owners.indexOf(tweet.user.id_str) == -1) { // is owner's tweet
                var outputs = [];
                for (var i = 0; i < input.length; i++) {
                    if (input[i].test(tweet.text.replace(/ /g, ''))) {
                        outputs.push(i);
                    }
                }
                if (outputs.length > 0) {
                    client.post('statuses/update', {
                        in_reply_to_status_id: tweet.id_str,
                        status:
                            '@' + tweet.user.screen_name + ' ' + output[outputs[Random.integer(0, outputs.length - 1)(mt)]]
                    }, function (error, rtweet, response) {
                        if (error) console.error(error);
                        else {
                            console.log('TLR [ @' + tweet.user.screen_name + ' : ' + tweet.text.replace(/\n/gi, '<br>') + ' -> @' + rtweet.user.screen_name + ' : ' + rtweet.text.replace(/\n/gi, '<br>') + ' ]');
                        }
                    });
                }
            }
        }
    };
}