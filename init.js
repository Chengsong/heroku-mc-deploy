request = require('request').defaults({ 'auth': { 'bearer': process.env.DROPBOX_API_TOKEN } });
fs = require('fs');
unzip = require('unzipper');

// MAIN
downloadWorld();

// FUNCTIONS
function downloadWorld() {
	getDownloadStream('/world.zip').pipe(unzip.Extract({path: './world'}));
}

function getDownloadStream(path) {
	callback = function (error, response, body) {
		if(error || response.statusCode != 200) {
			console.log(response.statusCode);
			console.log(body);
		} else {
			console.log(`file successfully downloaded: ${path}`);
		}
	};

	return request.post({
		url: 'https://content.dropboxapi.com/2/files/download',
		headers: {
			'Dropbox-API-Arg': JSON.stringify({'path': path})
		}
	}, callback);
}