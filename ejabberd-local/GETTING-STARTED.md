# Get an XMPP Server running locally

#### Prerequisites : 
- Brew
- Docker


## Initial Setup : 
Do this to setup your ejabberd instance

Add the following into your `etc/hosts` file

```
127.0.0.1       ideal-fortnight.example
127.0.0.1       conference.ideal-fortnight.example
127.0.0.1       proxy.ideal-fortnight.example
127.0.0.1       pubsub.ideal-fortnight.example
127.0.0.1       upload.ideal-fortnight.example
```

- Run `./make-certs.sh` to create your `.certs` folder
- Pull the docker image by running 
```
docker pull ghcr.io/processone/ejabberd
```
- Create your admin user : 
```bash
docker exec -it ejabberd ejabberdctl register admin ideal-fortnight.example passw0rd
```
> The name is important as the config file `ejabberd.yml` has references to `ideal-fortnight.example`domain and the `admin` user. 

