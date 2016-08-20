var express = require('express');
var fs = require('fs');
var app = express();
app.set('port', process.env.PORT || 8080);

app.get('/', function (req, res) {
	fs.readFile('../bin/ngrok.log', (err, data) => {
		if(err) console.log(err);

		res.send(data.match(/URL:tcp:\/\/(.*?)\s/)[1]);
	});
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});