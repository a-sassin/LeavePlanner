# !/bin/bash

npm start > nodeserver.log 2>&1 &

while ! grep -q "DB connected." nodeserver.log
do
  echo -e "building ... \n"  
  sleep 2
done
echo -e "Build successful\n"
kill -9 $(ps aux | grep '\snode\s' | awk '{print $2}')
exit 0