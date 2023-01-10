# Discord Bot MTX-SERV

![Project](https://img.shields.io/badge/Personnal-Project-2F77DF?labelColor=679EEE&style=for-the-badge)
![Node](https://img.shields.io/badge/Node%20Js-339933?style=for-the-badge&logo=Node.js&logoColor=ffffff)

Get gameserver status and control your server on Discord

This is a simple implementation of mTxServ API with Discord.

# mTxServ credential

* OAuth: https://mtxserv.com/fr/mon-compte/oauth
* Api Key: https://mtxserv.com/fr/mon-compte/api

# Discord

## Create Bot

You need to create credential on Discord: https://discordapp.com/developers/applications/

* Create Application
* Go to `settings` -> `Bot`
* Click on button `Add Bot`
* Get token
* Set `Public bot` to `off`
* Go to `OAuth2`
* In scope section, set `Bot` to `on`
* Set bot permission `Send Message` to `on` and use the URL generated to add it on your server

# Install

Dependencies
```
npm install
```

To use this bot, you need to create and replace none values in your configuration `config.json` :

```
{
    "id_serv": none, (in the url at your Mtxserv pannel)
    "id_serv_auth": (get in a post request with getAccessToken function),
    "grant_type": "https://mtxserv.com/grants/api_key",
    "client_id": none, (MtxServ parameter)
    "client_secret": "none, (MtxServ parameter)
    "api_key": "none", (MtxServ parameter)
    "discord_bot_token": "none" (Discord parameter)
}
```

Start the bot from the terminal :

```
node index.js
```
# Commands
- **!start** : start the server
- **!close** : close the server
- **!update** : update the server
- **!restart** : restart the server
- **!help** : list of commands
- **!perf** : server performance
- **!status** : servers status
- **!ip** : servers ip /!\ change in the code /!\