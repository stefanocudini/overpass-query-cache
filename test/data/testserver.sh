#!/bin/bash
#
echo 'listen http://localhost:9090/'
ncat -k -l -p 9090 -c "echo 'HTTP/1.1 200 OK\nContent-type: application/json\nconnection: close\\n'; echo '{\"status\":true}'"
