var express = require('express');
var fs = require('fs');
var app = express();
app.set('port', process.env.PORT || 8080);

process.on('SIGTERM', () => {
	console.log('index.js shutting down');
  process.exit(0);
});


app.get('/', function (req, res) {
	fs.readFile('./ngrok.log', (err, data) => {
		if(err) console.log(err);
		reg = /URL:tcp:\/\/(.*?)\s/
		data = reg.exec(data)[1] || 'no tcp port open';
		res.send(data);
	});
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
