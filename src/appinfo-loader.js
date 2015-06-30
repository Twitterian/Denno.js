var logger = require('./logger.js');
var HashMap = require('hashmap');
var Info = new HashMap();
exports.Load = function (dir) {
    var line = require('fs-sync').read(dir + '/app.info', 'utf8').split('\n');
    for (var i = 0; i < line.length; i++) {
        line[i] = line[i].trim(); // remove blank
        var item = line[i].split('='); // split line to item1=item2
        Info.set(item[0], item[1]);
        logger("\t> " + item[0] + " : " + item[1]);
    }
    return Info;
}