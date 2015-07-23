var logger = require('./../logger.js');
var AppInfo;

var members = [];
module.exports = function Run(dir, client) {
    logger("! Tweak 'SunungCeed' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var line = require('fs-sync').read(dir + '/members', 'utf8').split('\n');
    for (var i = 0; i < line.length; i++) {
        line[i] = line[i].trim();
        var item = line[i].split('='); // split line to item1=item2=item3

        members.push({
            reg: new RegExp(item[0], 'gi'),
            id_str: item[1],
            type: item[2],
            year: item[3]
        });

        var ml = (members[i].year != undefined) ? members[i].year : '';
        logger("\t" + members[i].reg + '(' + members[i].id_str + ') : ' + ml + members[i].type);

    }

    return function (tweet) {
        if (tweet.in_reply_to_status_id == undefined) {
            for (var itr = 0; itr < members.length; itr++) {
                if (members[itr].reg.test(tweet.text)) {
                    client.get('users/show', { user_id: members[itr].id_str }, function (error, ruser, response) {
                        switch (members[itr].type) {
                            case '수능':
                                var res = GetSunungString(members[itr].year);
                                client.post('statuses/update', {
                                    in_reply_to_status_id: (res.nonchutzana == true) ? tweet.id_str : undefined,
                                    status: (res.nonchutzana == true) ? '@' + tweet.user.screen_name + ' 걔는 이미 수능 쳤어요' : '@null @' + ruser.screen_name + ' ' + res.str
                                }, function (error, rtweet, response) {
                                    logger('SunungCeed : From @' + tweet.user.screen_name + ' > ' + rtweet.text.replace(/\n/gi, '<br>'));
                                });
                                break;
                            case '취업':
                                client.get('users/show', { user_id: '520039203' }, function (error, ruser, response) {
                                    client.post('statuses/update', {
                                        status: '@null @' + ruser.screen_name + ' ' + GetCheeuopString()
                                    }, function (error, rtweet, response) {
                                        logger('SunungCeed : From @' + tweet.user.screen_name + ' > ' + rtweet.text.replace(/\n/gi, '<br>'));
                                    });
                                });
                                break;
                        }
                    });
                    break;
                }
            }
        }
    }
}


function GetCheeuopString() {
    var current = require('./../syncedtime.js')();
    var IndependenceDate = new Date(10000, 12, 31, 23, 59);;

    var ref = IndependenceDate.getTime() - current.getTime();
    var milisec = parseInt(ref % 1000);
    ref /= 1000;
    var sec = parseInt(ref % 60);
    ref /= 60;
    var min = parseInt(ref % 60);
    ref /= 60;
    var hour = parseInt(ref % 24);
    ref /= 24;
    ref = parseInt(ref);

    return '취업까지 무려 ' + ref + '일 ' + hour + '시간 ' + min + '분 ' + sec + '초 ' + milisec + '밀리초씩이나 남았습니다.';;
}

function GetSunungString(year) {
    var output = { str: '', nonchutzana: false }
    var current = require('./../syncedtime.js')();
    var IndependenceDate = GetNextSunung(year);
    if (IndependenceDate.getTime() < current.getTime()) {
        output.nonchutzana = true;
        return output;
    }

    var ref = IndependenceDate.getTime() - current.getTime();
    var milisec = parseInt(ref % 1000);
    ref /= 1000;
    var sec = parseInt(ref % 60);
    ref /= 60;
    var min = parseInt(ref % 60);
    ref /= 60;
    var hour = parseInt(ref % 24);
    ref /= 24;
    ref = parseInt(ref);

    output.str += '수능까지 겨우 ' + ref + '일 ' + hour + '시간 ' + min + '분 ' + sec + '초 ' + milisec + '밀리초밖에 안남았습니다.';
    return output;
}

function GetNextSunung(year) {
    var month = 1, day = 1;
    if (year == 2015)
    {
        month = 11;
        day = 12;
    }
    else if (year == 2016)
    {
        month = 11;
        day = 10;
    }
    return new Date(year, month - 1, day, 8, 40);;
}