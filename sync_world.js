uploadWorld = require('./upload_world.js');

// MAIN
process.on('SIGTERM', () => {
	console.log('sync_world.js shutting down');
  process.exit(0);
});

setInterval(uploadWorld, 4 * 3600 * 1000); // 4 hours