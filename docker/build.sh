#!/bin/bash

# Usage: ./build [addictional-docker-build-args]
#
# Example: ./build --network-dkbuild

exdir=$(dirname `readlink -f "$0"`)

if [ ! -e "$exdir"/clone ]; then
	mkdir "$exdir"/clone; cd "$exdir"/clone; git clone "$exdir"/../.;
else
	cd "$exdir"/clone; git pull
fi

docker build $args $* -t searchathing/wht -f "$exdir"/Dockerfile "$exdir"/.
