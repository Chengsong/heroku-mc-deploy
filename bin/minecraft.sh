#!/bin/bash

# opens ngrok and see if it fails, when it does try again after 10 seconds
start_tunnel(){
	while true
	do
		echo -n "-----> Starting ngrok... "
		bin/ngrok tcp -authtoken $NGROK_API_TOKEN -log stdout --log-level info ${mc_port} | tee ngrok.log
		echo -n "ngrok failed, retrying after 10 seconds "
		sleep 10
	done
}

graceful_shutdown(){
	echo "KILLING $1 and $2"
	kill $1 $2 
	wait $1
	node last_sync.js
	exit 0
}

mc_port=25566


if [ -z "$NGROK_API_TOKEN" ]; then
  echo "You must set the NGROK_API_TOKEN config var to create a TCP tunnel!"
  exit 2
fi

# starts ngrok tunnel
start_tunnel &
ngrok_pid=$!

# downloads the world
node init.js

# create server config
if [ -f server.properties ]; then
  echo "server-port=${mc_port}" >> server.properties
fi
touch whitelist.json
touch banned-players.json
touch banned-ips.json
touch ops.json

heap="512m"

echo "Starting: minecraft ${mc_port}"
eval "java -Xmx${heap} -Xms${heap} -jar server.jar nogui &"
java_pid=$!

# trap "kill $ngrok_pid $java_pid" SIGTERM
trap "graceful_shutdown $java_pid $ngrok_pid" SIGTERM

# start syncing
node sync_world.js &

node index.js