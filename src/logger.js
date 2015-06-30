var maxLength = 100;
module.exports = function Log(string) {
    var lineEnd = (string.length > maxLength) ? ' ...' : '';
    console.log(string.substr(0, maxLength).replace(/\r\n|\r|\n/g, '<br>') + lineEnd);
}
