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

mc_port=25566
port=${PORT:-8080}


if [ -z "$NGROK_API_TOKEN" ]; then
  echo "You must set the NGROK_API_TOKEN config var to create a TCP tunnel!"
  exit 2
fi

#starts ngrok tunnel
start_tunnel &
ngrok_pid=$!

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
trap "echo 'KILLING $java_pid and $ngrok_pid'; kill $ngrok_pid $java_pid; exit 0" SIGTERM

# eval "ruby -rwebrick -e'WEBrick::HTTPServer.new(:BindAddress => \"0.0.0.0\", :Port => ${port}, :MimeTypes => {\"rhtml\" => \"text/html\"}, :DocumentRoot => Dir.pwd).start'"

while :
do
	ps
	sleep 30
done
