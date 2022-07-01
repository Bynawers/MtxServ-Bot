# Discord Bot MTX-SERV

![Project](https://img.shields.io/badge/Personnal-Project-2F77DF?labelColor=679EEE&style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000)

Get gameserver status on Discord
This is a **simple** implementation of mTxServ API with Discord.

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

```
npm install
```

To use this bot, you need to set your configuration in `config.json` :

```
cp config.json.dist config.json
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
- **!play** "name" || "url" : play music
- **!stop** : stop music
- **!skip** : skip music
- **!list** : list of upcoming songs
- **!find Merkel** : find piggy Merkel
- **!rank** : ranking of the best WOW servers
