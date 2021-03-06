﻿var logger = require('./../logger.js');
var AppInfo;

module.exports = function Run(dir, client, owners) {
    logger("! Tweak 'Gisuktime' Loading...");
    AppInfo = require('./../appinfo-loader.js').Load(dir);

    var RegStrs = [];
    var line = require('fs-sync').read(dir + '/strings', 'utf8').split('\n');
    for (var i = 0; i < line.length; i++) {
        line[i] = line[i].trim(); // remove blank
        RegStrs.push(new RegExp(line[i].replace(/ /g, ''), 'i'));
        logger('\t' + i + ' : ' + RegStrs[i]);
    }

    return function (tweet) {
        if (owners.indexOf(tweet.user.id_str) != -1) { // is owner's tweet
            if (tweet.in_reply_to_status_id == undefined) {
                for (var i = 0; i < RegStrs.length; i++) {
                    if (RegStrs[i].test(tweet.text.replace(/ /g, ''))) {
                        client.post('statuses/update', {
                            in_reply_to_status_id: tweet.id_str,
                            status:
                                '@' + tweet.user.screen_name + ' ' + GetGisukString()
                        }, function (error, rtweet, response) {
                            if (error) console.error(error);
                            else {
                                logger('Mention Gisuktime to @' + tweet.user.screen_name);
                            }
                        });
                        break;
                    }
                }
            }
        }
    };
}

function GetGisukString() {
    var current = require('./../syncedtime.js')();
    var IndependenceDate = GetNextIndipendanceDay(current);
    var ref = IndependenceDate.date.getTime() - current.getTime();
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
    str += (IndependenceDate.toDormitory)?'기숙사긔까지 겨우 ':'집사긔까지 무려 ';
    if (ref > 0) str += ref + '일 ';
    if (hour > 0) str += hour + '시간 ';
    if (min > 0) str += min + '분 ';
    if (sec > 0) str += sec + '초 ';
    str += milisec + '밀리초';
    str += (IndependenceDate.toDormitory) ? '밖에 안' : '씩이나 ';
    str += '남았습니다';
    return str;
}

function GetNextIndipendanceDay(date) {
    var Independence= {
        toDormitory: false,
        date: undefined
    };

    var weekday = date.getDay();
    var hour = date.getHours();
    var min = date.getMinutes();
    weekday -= 1;
    if (weekday < 0) { weekday = 6; }
    if (weekday == 4) {
        if (hour > 17 || (hour == 17 && min >= 30)) {
            Independence.toDormitory = true;
        }
    }
    else if (weekday == 5) {
        Independence.toDormitory = true;
    }
    else if (weekday == 6) {
        if (hour < 21) {
            Independence.toDormitory = true;
        }
    }


    if (Independence.toDormitory == true) // goto GISUKSA;
    {
        var day = date.getDate() + (6 - weekday);
        Independence.date = new Date(date.getFullYear(), date.getMonth(), day, 21);
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
        Independence.date = new Date(date.getFullYear(), date.getMonth(), day, 18, 30);
    }

    return Independence;
}