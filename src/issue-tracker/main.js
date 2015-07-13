var logger = require('./../logger.js');
var AppInfo;

module.exports = function Run(dir, client, owners) {
    logger("! Tweak 'Issue-Tracker' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var save_reg = new RegExp(AppInfo.get('save_keyword'));
    var load_reg = new RegExp(AppInfo.get('load_keyword'));
    var issuecnt_reg = new RegExp(AppInfo.get('get_issue_count_keword'));
    var lins_reg = new RegExp(AppInfo.get('load_issue_number_start_regex'));
    var line_reg = new RegExp(AppInfo.get('load_issue_number_end_regex'));

    var path = dir + '/Issues.txt';
    return function (tweet) {
        if (owners.indexOf(tweet.user.id_str) != -1) { // is owner's tweet
            // Save Issue
            if (tweet.in_reply_to_status_id == undefined) {
                if (save_reg.test(tweet.text)) {
                    var saveWord = tweet.text.replace(AppInfo.get('save_keyword'), '').trim() + '\n';
                    require('fs').writeFile(
                        path,
                        saveWord,
                        { flag: 'a+' }, function (err) {
                            if (err) console.error(err);
                            logger('Issue Saved : ' + saveWord);
                        });
                }


                // Load Issue
                if (load_reg.test(tweet.text)) {
                    var lines;
                    try {

                        lines = require('fs-sync').read(path, 'utf8').split('\n');
                    } catch (error) {
                        console.error(error);
                        if (error.errno == -4058) {
                            client.post('statuses/update', {
                                in_reply_to_status_id: tweet.id_str,
                                status: '@' + tweet.user.screen_name + ' 저장된 이슈가 없습니다.'
                            }, function (err, tweet, res) { });
                        }
                    }
                    
                    var issue_loadStart = -1;
                    var issue_loadEnd = Number(AppInfo.get('default_load_issue_number'));
                    if (lins_reg.test(tweet.text)) issue_loadStart = Number(tweet.text.match(lins_reg)[1]);
                    if (line_reg.test(tweet.text)) issue_loadEnd = Number(tweet.text.match(line_reg)[1]);
                    if (issue_loadStart == -1) {
                        issue_loadStart = (lines.length) - issue_loadEnd;
                        issue_loadEnd += issue_loadStart;
                    }

                    //logger(issue_loadStart + ' ' + issue_loadEnd + ' ' + (lines.length));

                    var output = '';
                    for (var i = issue_loadStart; i < issue_loadEnd; i++) {
                        if(lines[i] != undefined)  
                        {
                            output += lines[i] + '\n';
                        }
                    }

                    client.post('statuses/update', {
                        in_reply_to_status_id: tweet.id_str,
                        status: '@' + tweet.user.screen_name + '\n' + output
                    }, function (error, rtweet, response) {
                        if (error) {
                            console.error(error);
                        }
                        logger('Issue Loaded : ' + output);
                    });
                }

                if(issuecnt_reg.test(tweet.text))
                {
                    client.post('statuses/update', {
                        in_reply_to_status_id: tweet.id_str,
                        status: '@' + tweet.user.screen_name + ' 저장된 이슈 : ' + require('fs-sync').read(path, 'utf8').split('\n').length + '개'
                    }, function (error, rtweet, response) {
                        if (error) {
                            console.error(error);
                            if (error.errno == -4058) {
                                client.post('statuses/update', {
                                    in_reply_to_status_id: tweet.id_str,
                                    status: '@' + tweet.user.screen_name + ' 저장된 이슈가 없습니다.'
                                }, function (err, tweet, res) { });
                            }
                        }
                        logger('Issue Counted');
                    });
                }
            }
        }
    };
}