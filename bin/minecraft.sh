#!/bin/bash

# opens ngrok and see if it fails, when it does try again after 10 seconds
start_tunnel(){
	while true
	do
		echo -n "Starting ngrok... "
		bin/ngrok tcp -authtoken $NGROK_API_TOKEN -log stdout --log-level debug ${mc_port} &> ngrok.log
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

echo 'sleeping 30s to wait for previous instance to terminate'
sleep 30
echo 'starting deployment'

mc_port=25565


if [ -z "$NGROK_API_TOKEN" ]; then
  echo "You must set the NGROK_API_TOKEN config var to create a TCP tunnel!"
  exit 2
fi

if [ -z "$DROPBOX_API_TOKEN" ]; then
  echo "You must set the DROPBOX_API_TOKEN config var to sync with dropbox!"
  exit 3
fi

# starts ngrok tunnel
start_tunnel &
ngrok_pid=$!

# downloads the world
node init.js

# create server config
if [ ! -f server.properties ]; then
  echo "server-port=${mc_port}" >> server.properties
fi
touch whitelist.json
touch banned-players.json
touch banned-ips.json
touch ops.json

heap=${HEAP:-"1024M"}

echo "Starting: minecraft ${mc_port}"
java -Xmx${heap} -Xms${heap} -Xss512k -XX:+UseCompressedOops -jar server.jar nogui &
java_pid=$!

# trap "kill $ngrok_pid $java_pid" SIGTERM
trap "graceful_shutdown $java_pid $ngrok_pid" SIGTERM

# start syncing
node sync_world.js &

# start listening on $PORT
node index.js &

# curl the server every 25 min so it doesn't sleep
while true
do
	curl --silent 'http://cs-mc-server.herokuapp.com/' &> /dev/null
	sleep 1500
done
