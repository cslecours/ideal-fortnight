# Get an XMPP Server running locally

#### Prerequisites : 
- Brew
- Docker


## Initial Setup : 
Do this to setup your ejabberd instance

- Run `./make-certs.sh` to create your `.certs folder
- Pull the docker image by running 
```
docker pull ghcr.io/processone/ejabberd
```
- Create your admin user : 
```bash
docker exec -it ejabberd ejabberdctl register admin ideal-fortnight.example passw0rd
```
> The name is important as the config file `ejabberd.yml` has references to `ideal-fortnight.example`domain and the `admin` user. 

