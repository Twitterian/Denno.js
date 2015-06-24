exports.Launch = function Load(dir, client){
    require(dir + '/main.js')(dir, client);
}