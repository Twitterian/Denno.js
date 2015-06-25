console.log('\n\t! App launched !\n');

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
console.log("\tLoading app.info...")
var AppInfo = require('./src/appinfo-loader.js').Load('./src');


// Init twitter client
var client = new require('twitter')({
    consumer_key: AppInfo.get('consumer_key'),
    consumer_secret: AppInfo.get('consumer_secret'),
    access_token_key: AppInfo.get('access_token_key'),
    access_token_secret: AppInfo.get('access_token_secret')
});
client.get('account/verify_credentials', {}, function(error, user, response){
  if(error) throw error;
  console.log('\t\tLogged in : ' + user.name + '(@' + user.screen_name +' ' + user.id_str + ')');  // Raw response object. 
});
console.log();

// Load Async tweaks
var Loader = require('./tweak-launcher.js');
//Loader.Launch('./src/regular-tweets', client);
Loader.Launch('./src/gisuktime', client);
Loader.Launch('./src/timeline-reaction', client);

console.log("\n\t! index.js EOF !\n");