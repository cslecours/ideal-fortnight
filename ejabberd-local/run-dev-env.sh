#!/bin/sh

mkdir database

cleanup() {
  docker stop ejabberd  
  docker remove ejabberd
}

trap cleanup EXIT

docker run --name ejabberd -it \
  -v $(pwd)/ejabberd.yml:/opt/ejabberd/conf/ejabberd.yml \
  -v $(pwd)/.certs/:/opt/ejabberd/ideal-fortnight.example/ \
  -v $(pwd)/database:/opt/ejabberd/database \
  -p 5222:5222 \
  -p 5443:5443 \
  ghcr.io/processone/ejabberd live 

