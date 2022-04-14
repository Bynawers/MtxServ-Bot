const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const querystring = require('querystring');

const oauthTokenUrl = 'https://mtxserv.com/oauth/v2/token?';
const viewerApiUrl =
    'https://mtxserv.com/api/v1/viewers/game?ip=' +
    config.gameserver_ip +
    '&port=' +
    config.gameserver_port +
    '&type=' +
    config.gameserver_type;

const serverApiUrl = 'https://mtxserv.com/api/v1/game/712412/servers';

const perfApiUrl = 'https://mtxserv.com//api/v1/game/612338/resources'

const startApiUrl = 'https://mtxserv.com/api/v1/game/612338/actions/start'
const stopApiUrl = 'https://mtxserv.com/api/v1/game/612338/actions/stop'
const restartApiUrl = 'https://mtxserv.com/api/v1/game/612338/actions/restart'
const updateApiUrl = 'https://mtxserv.com/api/v1/game/612338/actions/update'

const authParams = {
    grant_type: 'https://mtxserv.com/grants/api_key',
    client_id: config.mtxserv_client_id,
    client_secret: config.mtxserv_client_secret,
    api_key: config.mtxserv_api_key,
};

const getAccessToken = function(params, callback) {
    request(
        {
            url: oauthTokenUrl + querystring.stringify(params),
            json: true,
            followRedirect: false,
        },
        function(error, response, body) {
            if (
                null !== error ||
                response.statusCode !== 200 ||
                typeof body.access_token === 'undefined'
            ) {
                console.log(
                    "Can't retrieve access_token data, check your credentials (" +
                        response.statusCode +
                        ' ' +
                        (error !== null ? error : '') +
                        ')',
                );
                return;
            }
            console.log(body.access_token)
            callback(body.access_token);
        },
    );
};

const stringify_viewer_response = function(data) {
    const address = data.ip.toUpperCase() + ':' + data.port;

    if (!data.is_online) {
        return 'Server ' + address + ' is currently offline.';
    }

    return (
        data.params.host_name +
        ' (' +
        data.params.used_slots +
        '/' +
        data.params.max_slots +
        ') - ' +
        address
    );
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '!status') {
        getAccessToken(authParams, function(accessToken) {
            request(
                {
                    url: viewerApiUrl + '&access_token=' + accessToken,
                    json: true,
                },
                function(error, response, body) {
                    if (null !== error || response.statusCode !== 200) {
                        console.log(
                            "Can't retrieve viewer data (" +
                                response.statusCode +
                                ' ' +
                                (error !== null ? error : '') +
                                ')',
                        );
                        msg.reply("An error occured, can't retrieve server data");
                        return;
                    }
    
                    msg.channel.send(stringify_viewer_response(body));
                },
            );
        });
    }

    else if (msg.content === '!ip') {
        getAccessToken(authParams, function(accessToken) {
            request(
                {
                    url: serverApiUrl + '?access_token=' + accessToken,
                    json: true,
                },
                function(error, response, body) {
                    if (null !== error || response.statusCode !== 200) {
                        console.log(
                            "Can't retrieve viewer data (" +
                                response.statusCode +
                                ' ' +
                                (error !== null ? error : '') +
                                ')',
                        );
                        msg.reply("An error occured, can't retrieve server data");
                        return;
                    }
                    console.log(body)
                    msg.channel.send(body[0].host+" - "+body[0].game+"\nip: "+body[0].ip+":"+body[0].port+"\nmdp: gangsta");
                },
            );
        });
    }

    else if (msg.content === '!perf') {
        getAccessToken(authParams, function(accessToken) {
            request(
                {
                    url: perfApiUrl + '?access_token=' + accessToken,
                    json: true,
                },
                function(error, response, body) {
                    if (null !== error || response.statusCode !== 200) {
                        console.log(
                            "Can't retrieve viewer data (" +
                                response.statusCode +
                                ' ' +
                                (error !== null ? error : '') +
                                ')',
                        );
                        msg.reply("An error occured, can't retrieve server data");
                        return;
                    }
                    console.log(body)
                    msg.channel.send("Performance:\nCPU: "+body.cpu_used+"%"+"\nRAM: "+body.ram_used+" Mo"+"\nRAM_max: "+body.ram_max+"Mo");
                },
            );
        });
    }

    else if (msg.content === '!start' || msg.content === '!stop' || msg.content === '!update' || msg.content === '!restart') {
        getAccessToken(authParams, function(accessToken) {
            request(
                {
                    method: 'POST',
                    url: (msg.content === "!start" ? startApiUrl : msg.content === "!stop" ? stopApiUrl : msg.content === "!update" ? updateApiUrl : restartApiUrl) + '?access_token=' + accessToken,
                    json: true,
                },
                function(error, response, body) {
                    if (response.statusCode !== 201) {
                        console.log(
                            "Can't post data (" +
                                response.statusCode +
                                ' ' +
                                (error !== null ? error : '') +
                                ')',
                        );
                        msg.reply("Error : "+response.statusCode);
                        return;
                    }
                    console.log(body)
                    switch (msg.content) {
                        case "!start":
                            msg.reply("Lancement du serveur")
                            break;
                        case "!stop":
                            msg.reply("Fermeture du serveur")
                            break;
                        case "!update":
                            msg.reply("Mise à jour du serveur")
                            break;
                        case "!restart":
                            msg.reply("Restart du serveur")
                            break;
                        default:
                            break;
                    }
                },
            );
        });
    }

    else if (msg.content === '!help') {
        msg.channel.send('**Liste des commands du bot:**\n- **!start :** Démarre le serveur\n- **!stop :** Eteint le serveur\n- **!restart :** Relance le serveur\n- **!update :** Met à jour le serveur\n- **!perf :** Performance du serveur\n- **!status :** Etat du serveur\n- **!ip :** Champs de connection du serveur')
    }
    
});

client.login(config.discord_bot_token);

// id : 712412
// id_serv : 612338
