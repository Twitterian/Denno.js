var AppInfo;
var Random = require('random-js');
var mt = Random.engines.mt19937();
mt.autoSeed();

module.exports = function Run(dir, client) {
    console.log("\tTweak 'Gisuktime' Loading...");
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
            if (tweet.retweeted_status == undefined) {
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
            //console.error(error);
        });
    });
}

function GetGisukString()
{
    var current = require('./../syncedtime.js')();
    var target = GetNextIndipendanceDay(current);
    var ref = target.getTime() - current.getTime();
    var milisec = parseInt(ref % 1000);
    ref /= 1000;
    var sec = parseInt(ref % 60);
    ref /= 60;
    var min = parseInt(ref % 60);
    ref /= 60;
    var hour = parseInt(ref % 24);
    ref /= 24;
    ref = parseInt(ref);

    var str = '';
    if (ref > 0) str += ref + '일 ';
    if (hour > 0) str += hour + '시간 ';
    if (min > 0) str += min + '분 ';
    if (sec > 0) str += sec + '초 ';
    str += milisec + '밀리초 남았습니다';

    return str;
}

function GetNextIndipendanceDay(date)
{
    var toDormitory = false;
    var weekday = date.getDay();
    var hour = date.getHours();
    var min = date.getMinutes();
    weekday -= 1;
    if (weekday < 0) { weekday = 6; }
    if (weekday == 4)
    {
        if( hour> 17 || (hour == 17 && min>= 30))
        {
            toDormitory = true;
        }
    }
    else if (weekday == 5)
    {
        toDormitory = true;
    }
    else if(weekday == 6)
    {
        if(hour<21)
        {
            toDormitory = true;
        }
    }

    var IndipendanceDay;

    if(toDormitory==true) // goto GISUKSA;
    {
        var day = date.getDate() + (6 - weekday);
        IndipendanceDay = new Date(date.getFullYear(), date.getMonth(), day, 21);
    }
    else // goto HOME;
    {
        var day = date.getDate();
        if (weekday < 4) {
            day += 4 - weekday;
        }
        else if (weekday > 4) {
            day += weekday;
        }
        IndipendanceDay = new Date(date.getFullYear(), date.getMonth(), day, 18, 30);
    }

    return IndipendanceDay;
}