var AppInfo;
var Random = require('random-js');
var mt = Random.engines.mt19937();
mt.autoSeed();


module.exports = function Run(dir, client) {
    console.log("\tTweak 'Timeline-ReAction' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var input = [];
    var output = [];
    var line = require('fs-sync').read(dir + '/strings', 'utf8').split('\r\n');
    for (var i = 0; i < line.length; i++) {
        line[i] = line[i].trim(); // remove blank
        var item = line[i].split('='); // split line to item1=item2
        input.push(new RegExp(item[0].replace(/ /g, ''), 'i'));
        output.push(item[1]);
        console.log("\t\t" + i + ' ' + input[i], output[i]);
    }

    client.stream('user', { replies: 'all' }, function (stream) {
        stream.on('data', function (tweet) {
            if (tweet.retweeted_status == undefined) {
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
                            '@' + tweet.user.screen_name + '\n' + output[outputs[Random.integer(0, outputs.length - 1)(mt)]]
                    }, function (error, tweet, response) { if (error) console.error(error); });
                }
            }
        });

        stream.on('error', function (error) {
            console.error(error);
        });
    });
}