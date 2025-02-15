#!/bin/sh

# Reference article : https://web.dev/articles/how-to-use-local-https

mkdir $(pwd)/.certs
cd $(pwd)/.certs

brew install mkcert
mkcert -install

mkcert ideal-fortnight.example
mkcert conference.ideal-fortnight.example
mkcert proxy.ideal-fortnight.example
mkcert pubsub.ideal-fortnight.example
mkcert upload.ideal-fortnight.example
