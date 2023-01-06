const request = require('request');
const querystring = require('querystring');

const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_MESSAGE_TYPING",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS",
        "DIRECT_MESSAGE_TYPING",
    ],
    partials: [
        'CHANNEL',
    ]
});

const config = require('./config.json');

let isOnline = false;

const queue = new Map();

const oauthTokenUrl = 'https://mtxserv.com/oauth/v2/token?';

const serverApiUrl = 'https://mtxserv.com/api/v1/game/'+ config.id_serv+'/servers';

const perfApiUrl = 'https://mtxserv.com//api/v1/game/'+config.id_serv_auth+'/resources'

const startApiUrl = 'https://mtxserv.com/api/v1/game/'+config.id_serv_auth+'/actions/start'
const stopApiUrl = 'https://mtxserv.com/api/v1/game/'+config.id_serv_auth+'/actions/stop'
const restartApiUrl = 'https://mtxserv.com/api/v1/game/'+config.id_serv_auth+'/actions/restart'
const updateApiUrl = 'https://mtxserv.com/api/v1/game/'+config.id_serv_auth+'/actions/update'

const authParams = {
    grant_type: 'https://mtxserv.com/grants/api_key',
    client_id: config.mtxserv_client_id,
    client_secret: config.mtxserv_client_secret,
    api_key: config.mtxserv_api_key,
};

const getAccessToken = function(params, callback) {
    request(
        {
            url: oauthTokenUrl + "grant_type=https%3A%2F%2Fmtxserv.com%2Fgrants%2Fapi_key&client_id="+config.client_id+"&client_secret="+config.client_secret+"&api_key="+config.api_key,
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
                console.log(oauthTokenUrl + querystring.stringify(params))
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

client.on('message', message => {

    console.log(message.content)

    switch(message.content){

        case "!status": {
            const embed = new MessageEmbed()
                .setColor(isOnline ? 'GREEN' : 'RED')
                .setTitle('Status du serveur')
                .addFields(
                    { name:"Le serveur est actuellement:", value:  isOnline ? ":green_circle: Ouvert" : ":red_circle: Fermé" })
                .setTimestamp()
                .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                ;
                message.channel.send({ embed });
            return;
        }

        case "!ip": {
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
                            message.reply("An error occured, can't retrieve server data");
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
                        message.channel.send({ embed });
                    },
                );
            });
            return;
        }
        case "!perf": {
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
                            message.reply("An error occured, can't retrieve server data");
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
                        message.channel.send({ embed });
                    },
                );
            });
            return;
        }

        case "!start": case "!close": case "!update": case "!restart": {
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
                        url: (message.content === "!start" ? startApiUrl : message.content === "!close" ? stopApiUrl : message.content === "!update" ? updateApiUrl : restartApiUrl) + '?access_token=' + accessToken,
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
                            message.reply("Error : "+response.statusCode);
                            return;
                        }
                        console.log(body)
                        let embed = customEmbed('none', 'white');
    
                        switch (message.content) {
                            case "!start":
                                isOnline = true;
                                embed = customEmbed('Lancement du serveur', 'GREEN');
                                message.channel.send({ embed });
                                break;
                            case "!close":
                                isOnline = false;
                                embed = customEmbed('Fermeture du serveur', 'RED');
                                message.channel.send({ embed });
                                break;
                            case "!update":
                                embed = customEmbed('Mise à jour du serveur', 'YELLOW');
                                message.channel.send({ embed });
                                break;
                            case "!restart":
                                isOnline = true;
                                embed = customEmbed('Restart du serveur', 'GREEN');
                                message.channel.send({ embed });
                                break;
                            default:
                                break;
                        }
                    },
                );
            });
            return;
        }

        case "!help":{
            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setTitle('Liste des commands du bot')
                .addFields(
                    { name: '!start', value: 'Ouvre le serveur' },
                    { name: '!close', value: 'Eteint le serveur' },
                    { name: '!restart', value: 'Relance le serveur' },
                    { name: '!update', value: 'Met à jour le serveur' },
                    { name: '!perf', value: 'Performance du serveur' },
                    { name: '!status', value: 'Etat du serveur' },
                    { name: '!ip', value: 'Champs de connection du serveur' },
                    { name: '!rank', value: 'Classement (OFFICIEL) des meilleurs serveur Wow' },
                    { name: '!find Merkel', value: 'Trouve Merkel' }
                )
                .setTimestamp()
                .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                ;
                message.channel.send({ embed });
            return;
        }

        case "!find Merkel": {
            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setTitle('Le sanglier Merkel')
                .setImage('https://www.fun-academy.fr/wp-content/uploads/2021/02/valheim-taming.jpg')
                .setTimestamp()
                .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                ;
            message.channel.send({ embed });
            return;
        }

        case "!rank": {
            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setTitle('Ranking meilleur serveurs FR-WOW')
                .setDescription(':first_place: Archimonde \n:second_place: Hyjal\n:third_place: Dalaran\n**#4** Ysondre\n**#5** Confrérie du Thorium\n**#6** Elune\n**#7** Sargeras\n**#8** Kael\'Thas\n**#9** Medivh\n**LE PIRE** Uldaman')
                .setTimestamp()
                .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                ;
            message.channel.send({ embed });
            return;
        }
        case "!list": {
            const server_queue = queue.get(message.guild.id);
            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setTitle('Prochaines musiques :')
                .setTimestamp()
                .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                ;
            if (!server_queue) { 
                return message.channel.send(`:warning: Il n'y a pas de musique dans la file d'attente !`); 
            }
            server_queue.songs.map( (item, index) => { embed.addField(`#${index+1}`, `${item.title}`) });
            message.channel.send({ embed });
            return;
        }
    }
});

client.login(config.discord_bot_token);