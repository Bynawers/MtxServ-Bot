const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const querystring = require('querystring');
const { MessageEmbed } = require('discord.js');

let isOnline = false;

const oauthTokenUrl = 'https://mtxserv.com/oauth/v2/token?';

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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '!status') {
        const embed = new MessageEmbed()
            .setColor(isOnline ? 'GREEN' : 'RED')
            .setTitle('Status du serveur')
            .addFields(
                { name:"Le serveur est actuellement:", value:  isOnline ? ":green_circle: Ouvert" : ":red_circle: Fermé" })
            .setTimestamp()
            .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
            ;
        msg.channel.send({ embed });
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
                    const embed = new MessageEmbed()
                        .setColor('BLUE')
                        .setTitle('Adresse du serveur')
                        .addFields(
                            { name: `${body[0].host}`, value: `${body[0].game}` },
                            { name: 'ip', value: `${body[0].ip}`+":"+`${body[0].port}` },
                            { name: 'mdp', value: 'gangsta' },
                        )
                        .setTimestamp()
                        .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                    ;
                    msg.channel.send({ embed });
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
                    const embed = new MessageEmbed()
                        .setColor('BLUE')
                        .setTitle('Performance du serveur')
                        .addFields(
                            { name: `CPU`, value: `${body.cpu_used}`+" %" },
                            { name: 'RAM', value: `${body.ram_used}`+" Mo" },
                            { name: 'RAM_max', value: `${body.ram_max}`+" Mo" },
                        )
                        .setTimestamp()
                        .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                    ;
                    msg.channel.send({ embed });
                },
            );
        });
    }

    else if (msg.content === '!start' || msg.content === '!stop' || msg.content === '!update' || msg.content === '!restart') {

        const customEmbed = (query, color) => {
            return new MessageEmbed()
            .setColor(`${color}`)
            .setTitle(`${query}`)
            .setTimestamp()
            .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
        ;}
        
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
                    let embed = customEmbed('none', 'white');

                    switch (msg.content) {
                        case "!start":
                            isOnline = true;
                            embed = customEmbed('Lancement du serveur', 'GREEN');
                            msg.channel.send({ embed });
                            break;
                        case "!stop":
                            isOnline = false;
                            embed = customEmbed('Fermeture du serveur', 'RED');
                            msg.channel.send({ embed });
                            break;
                        case "!update":
                            embed = customEmbed('Mise à jour du serveur', 'YELLOW');
                            msg.channel.send({ embed });
                            break;
                        case "!restart":
                            isOnline = true;
                            embed = customEmbed('Restart du serveur', 'GREEN');
                            msg.channel.send({ embed });
                            break;
                        default:
                            break;
                    }
                },
            );
        });
    }

    else if (msg.content === '!help') {
        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle('Liste des commands du bot')
            .addFields(
                { name: '!start', value: 'Ouvre le serveur' },
                { name: '!stop', value: 'Eteint le serveur' },
                { name: '!restart', value: 'Relance le serveur' },
                { name: '!update', value: 'Met à jour le serveur' },
                { name: '!perf', value: 'Performance du serveur' },
                { name: '!status', value: 'Etat du serveur' },
                { name: '!ip', value: 'Champs de connection du serveur' },
            )
            .setTimestamp()
            .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
        ;
        msg.channel.send({ embed });
    }

    else if (msg.content === '!find Merkel') {
        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle('Le sanglier Merkel')
            .setImage('https://www.fun-academy.fr/wp-content/uploads/2021/02/valheim-taming.jpg')
            .setTimestamp()
            .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
        ;
        msg.channel.send({ embed });
    }
    
});

client.login(config.discord_bot_token);

// id : 712412
// id_serv : 612338