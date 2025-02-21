#!/bin/sh

SCRIPT_DIR=$(dirname "$0")
mkdir "$SCRIPT_DIR/database"

cleanup() {
  docker stop ejabberd  
  docker remove ejabberd
}

trap cleanup EXIT

docker run --name ejabberd -it \
  -v $SCRIPT_DIR/ejabberd.yml:/opt/ejabberd/conf/ejabberd.yml \
  -v $SCRIPT_DIR/.certs/:/opt/ejabberd/ideal-fortnight.example/ \
  -v $SCRIPT_DIR/database:/opt/ejabberd/database \
  -p 5222:5222 \
  -p 5443:5443 \
  -p 1883:1883 \
  ghcr.io/processone/ejabberd live 

