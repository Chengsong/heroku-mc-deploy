$TOKEN = 'SLbGl_ZVuVAAAAAAAAAAjJPhsYbjwLlObufaxjlMNjj56lCLWsUDB1uXYPw3CTF7';

request = require('request').defaults({ 'auth': { 'bearer': $TOKEN } });
fs = require('fs');
archiver = require('archiver');
unzip = require('unzipper');

// DOWNLOAD
download();

// UPLOAD
// upload();

// INTERVAL
// continuousUpload();

// ZIP
// zip();
// unzipDir();

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

function download() {
	getDownloadStream('/image.png').pipe(fs.createWriteStream('image.png'));		
}

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
function upload() {
	fs.createReadStream('test.txt').pipe(getUploadStream('/test.txt'));
}

function continuousUpload() {
	counter = 0;

	work = function() {
		counter++;
		console.log('modifying file');
		fs.writeFile("test.txt", counter, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log(`file saved with value ${counter}... starting upload`);
	    upload();
		}); 

	};

	setInterval(work, 10000);
}

function zip() {
	output = getUploadStream('/target.zip');
	archive = archiver('zip');
	archive.on('error', function(err) {
		throw err;
	});
	archive.pipe(output);
	archive.directory('zip_dir', '');
	archive.finalize();
}

function unzipDir() {
	getDownloadStream('/target.zip').pipe(unzip.Extract({path: 'unzip_dir'}));
}