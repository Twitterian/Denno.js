var logger = require('./src/logger.js');
logger('! App launched !');

// Web init
var app = require('express')();
app.use(require('body-parser')());
app.use(require('express').static('public'));
app.get("/", function (req, res) {
    res.send("Composed by usagi powered by io.js");
});
// To-do : add here error handler
require('http').createServer(app).listen(process.env.PORT || 3000, function () { });

// Load app.info
logger("Loading app.info...")
var AppInfo = require('./src/appinfo-loader.js').Load('./src');

// Init twitter client
var client = new require('twitter')({
    consumer_key: AppInfo.get('consumer_key'),
    consumer_secret: AppInfo.get('consumer_secret'),
    access_token_key: AppInfo.get('access_token_key'),
    access_token_secret: AppInfo.get('access_token_secret')
});

var Owners = [];
var line = require('fs-sync').read('./src/owners.id_str', 'utf8').split('\n');
for (var i = 0; i < line.length; i++) {
    logger('\t' + i + ' : ' + line[i]);
    Owners.push(line[i]);
}

client.get('account/verify_credentials', {}, function (error, user, response) {
    if (error) console.error(error);
    else {
        var run = true;
        logger('\t\tLogged in : ' + user.name + '(@' + user.screen_name + ' ' + user.id_str + ')\n');  // Raw response object. 

        // Load tweaks
        var reg_tweet = require('./src/regular-tweets/main.js')('./src/regular-tweets');
        var gisuktime = require('./src/gisuktime/main.js')('./src/gisuktime', client, Owners);
        var tl_reaction = require('./src/timeline-reaction/main.js')('./src/timeline-reaction', client, Owners);
        var remote_exit = require('./src/remote-exit/main.js')('./src/remote-exit', Owners);
        var issue_tracker = require('./src/issue-tracker/main.js')('./src/issue-tracker', client, Owners);

        reg_tweet(client);
        
        client.stream('user', { replies: 'all' }, function (stream) {
            
            stream.on('data', function (tweet) {
                if (tweet.source != undefined &&
                    tweet.event == undefined &&
                    tweet.retweeted_status == undefined) {
                    run = remote_exit(tweet, run);
                    if (run)
                    {
                        gisuktime(tweet);
                        tl_reaction(tweet, user);
                        issue_tracker(tweet);
                    }
                }
            });

            stream.on('error', function (error) { console.error(error); });
        });

    }
});

logger("! index.js EOF !");
