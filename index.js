var express = require('express');
var app = express();

app.get('/', function (req, res) {
	console.log('request to root');
  res.send('Hello World!');
});

port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('App listening to ' + port + '!');
});