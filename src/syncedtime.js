module.exports = function GetSyncedDate() {
    var adj = 32400000;
    //adj = 0;
    var date = new Date();
    date.setTime(date.getTime() + adj);

    return date;
}
