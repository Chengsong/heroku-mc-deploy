request = require('request').defaults({ 'auth': { 'bearer': process.env.DROPBOX_API_TOKEN } });
fs = require('fs');
archiver = require('archiver');

// MAIN
function uploadWorld() {
	output = getUploadStream('/world.zip');
	archive = archiver('zip');
	archive.on('error', err => {throw err;});
	archive.pipe(output);
	archive.directory('world', '');
	archive.finalize();
}

// FUNCTIONS
function getUploadStream(path) {
	callback = function (error, response, body) {
		if(error || response.statusCode != 200) {
			console.log(response.statusCode);
			console.log(body);
		} else {
			console.log(`file successfully uploaded: ${path}`);
		}
	};
	return request.post({
		url: 'https://content.dropboxapi.com/2/files/upload',
		headers: {
			'Dropbox-API-Arg': JSON.stringify({
				'path': path,
				'autorename': false,
				'mute': true,
				'mode': {'.tag':'overwrite'}
			}),
			'Content-Type': 'application/octet-stream'
		}
	}, callback);
}

module.exports = uploadWorld;