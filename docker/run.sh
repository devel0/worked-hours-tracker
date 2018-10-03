#!/bin/bash

#set -x

source /scripts/constants
source /scripts/utils.sh

container=wht
container_image=searchathing/wht

#net=wht
net=
net=build

#ip="$ip_wht_srv"
ip=

cpus="3"
memory="512m"

dk-rm-if-exists "$container"

exdir="$(executing_dir)"

docker run \
	-d \
	--name="$container" \
	--hostname="$container" \
	--network="$net" \
	--ip="$ip" \
	--restart="unless-stopped" \
	--cpus="$cpus" \
	--memory="$memory" \
	"$container_image"
