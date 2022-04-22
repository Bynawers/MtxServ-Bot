const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
const request = require('request');
const querystring = require('querystring');
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

let isOnline = false;

const queue = new Map();

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

    const serverQueue = queue.get(msg.guild.id);

    switch(msg.content){

        case "!status": {
            const embed = new MessageEmbed()
                .setColor(isOnline ? 'GREEN' : 'RED')
                .setTitle('Status du serveur')
                .addFields(
                    { name:"Le serveur est actuellement:", value:  isOnline ? ":green_circle: Ouvert" : ":red_circle: Fermé" })
                .setTimestamp()
                .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                ;
            msg.channel.send({ embed });
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
                            case "!close":
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
                    { name: '!find Merkel', value: 'Trouve Merkel' },
                    { name: '!play', value: 'Joue la musique' },
                    { name: '!stop', value: 'Arrête la musique' },
                    { name: '!skip', value: 'Joue la musique suivante' },
                )
                .setTimestamp()
                .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                ;
            msg.channel.send({ embed });
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
            msg.channel.send({ embed });
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
            msg.channel.send({ embed });
            return;
        }
    }
    if (msg.content.startsWith(`!play`) || msg.content.startsWith(`!stop`) || msg.content.startsWith(`!skip`)) {
        const args = msg.content.slice(1).split(/ +/);
        const cmd = args.shift().toLowerCase();
        execute(msg, args, cmd);
    }
});

async function execute(msg, args, cmd, client, Discord){

        const voice_channel = msg.member.voice.channel;
        if (!voice_channel) return msg.channel.send(':warning: Tu dois être dans un channel pour executer la commande!');
        const permissions = voice_channel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT')) return msg.channel.send(':warning: Tu n\'a pas les permissions');
        if (!permissions.has('SPEAK')) return msg.channel.send(':warning: Tu n\'a pas les permissions');

        const server_queue = queue.get(msg.guild.id);

        if (cmd === 'play'){
            if (!args.length) return msg.channel.send(':warning: Tu dois ajouter un second argument!');
            let song = {};

            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                const video_finder = async (query) =>{
                    const video_result = await ytSearch(query);
                    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                }

                const video = await video_finder(args.join(' '));
                if (video){
                    song = { title: video.title, url: video.url }
                } else {
                     msg.channel.send(':warning: vidéo introuvable');
                }
            }

            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: msg.channel,
                    connection: null,
                    songs: []
                }
                queue.set(msg.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                try {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(msg.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(msg.guild.id);
                    msg.channel.send(':warning: problème de connection');
                    throw err;
                }
            } else{
                server_queue.songs.push(song);
                const embed = new MessageEmbed()
                    .setColor('BLUE')
                    .setTitle(`Ajout à la file d\'attente`)
                    .setDescription(`${song.title}`)
                    .setTimestamp()
                    .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
                    ;
                msg.channel.send({ embed });
            }
        }

        else if(cmd === 'skip') { skip_song(msg, server_queue); }
        else if(cmd === 'stop') { stop_song(msg, server_queue); }
    }
    

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    song_queue.connection.play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
    });
    const embed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle('Je chante actuellement:')
        .setDescription(`${song.title}`)
        .setTimestamp()
        .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
        ;
    await song_queue.text_channel.send({ embed });
}

const skip_song = (msg, server_queue) => {
    if (!msg.member.voice.channel) return msg.channel.send(':warning: Tu dois être dans un channel pour executer la commande!');
    if(!server_queue){
        return msg.channel.send(`:warning: Il n'y a plus de musique dans la file d'attente !`);
    }
    server_queue.connection.dispatcher.end();
}

const stop_song = (msg, server_queue) => {
    if (!msg.member.voice.channel) return msg.channel.send(':warning: Tu dois être dans un channel pour executer la commande!');

    try {
        server_queue.songs = [];
        server_queue.connection.dispatcher.end();
    } catch (err) {
        msg.channel.send(":warning: Aucune musique en cours de lecture !");
        return;
    }
    const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle(`Okok je pars...`)
        .setTimestamp()
        .setFooter('Merci Lord', "https://m.media-amazon.com/images/I/71BviJmwbiL._AC_SL1497_.jpg");
        ;
    msg.channel.send({ embed });
}

client.login(config.discord_bot_token);

// id : 712412
// id_serv : 612338