const { Collection, MessageEmbed } = require('discord.js');
const GeneratorSchema = require('../models/generator-schema');
const voiceCollection = new Collection();
const chatCollection = new Collection();
const client = require('../index');

client.on('voiceStateUpdate', async (oldState, newState) => {
    const user = await client.users.fetch(newState.id);
    const member = newState.guild.member(user);

    let generatorID = '';
    let categoryID = '';

    await GeneratorSchema.findOne({ Guild: newState.guild.id }, (err, data) => {
        if (data) {
            if (newState.guild.channels.cache.get(data.Channel)) generatorID = data.Channel;
            else return;
            if (newState.guild.channels.cache.get(data.Category)) categoryID = data.Category;
            else return console.log('NO PRIVATE VC CATEGORY FOUND!');
        }
    })

    if (!oldState.channel && newState.channel.id === generatorID) {
        //! CREATE VOICE CHAT
        const vc = await newState.guild.channels.create(`${user.username}'s VC`, {
            type: 'voice',
            parent: categoryID,
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'STREAM', 'USE_VAD']
                },
                {
                    id: newState.guild.id,
                    deny: ['VIEW_CHANNEL']
                }
            ]
        });
        member.voice.setChannel(vc);
        voiceCollection.set(user.id, vc.id);
        
        //! CREATE TEXT CHAT
        const chat = await newState.guild.channels.create(`${user.username}-control-panel`, {
            type: 'text',
            parent: categoryID,
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL'],
                    deny: ['SEND_MESSAGES', 'ADD_REACTIONS']
                },
                {
                    id: newState.guild.id,
                    deny: ['VIEW_CHANNEL']
                }
            ]
        });
        chatCollection.set(user.id, chat.id);

        const embed = new MessageEmbed()
            .setDescription('👻 скрыть канал на сервере и сделать его невидимым\n\n👁 сделать канал снова видимым\n\n🔒 заблокировать канал от входа других пользователей\n\n🔓 разблокировать канал для входа других пользователей\n\n1️⃣ - 5️⃣ ограничение на количество пользователей')
            .setColor('00D166')

        chat.send(`<@${user.id}>`, embed)
            .then((embed) => {
                embed.react('👻'); // make invisible
                embed.react('👁'); // make visible

                embed.react('🔒'); // do not allow users to join
                embed.react('🔓'); // allows users to join

                embed.react('1️⃣'); // user limit: 1
                embed.react('2️⃣'); // user limit: 2
                embed.react('3️⃣'); // user limit: 3
                embed.react('4️⃣'); // user limit: 4
                embed.react('5️⃣'); // user limit: 5
            })

    } else if (!newState.channel) {

        if (oldState.channel.id === voiceCollection.get(newState.id)) {
            oldState.channel.delete(); // delete voice chat

            const embed = new MessageEmbed()
                .setDescription('⚠ Канал будет удалён через 10 секунд!')
                .setColor('F93A2F')
            newState.guild.channels.cache.get(chatCollection.get(newState.id)).send(embed);

            setTimeout(function() { deleteTextChannel(newState) }, 9000) // delete text chat (after 9 seconds)
            return;
        }

        function deleteTextChannel(chat) {
            chat.guild.channels.cache.get(chatCollection.get(chat.id)).delete() 
        }
    }
})


//! control functions

//* MAKES VC INVISIBLE FOR @everyone
function makeInvisible(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.updateOverwrite(messageReaction.message.guild.id, { VIEW_CHANNEL: false });
}

//* MAKES VC VISIBLE FOR @everyone
function makeVisible(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.updateOverwrite(messageReaction.message.guild.id, { VIEW_CHANNEL: true });
}

//* ALLOWS @everyone TO CONNECT
function makeJoinable(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.updateOverwrite(messageReaction.message.guild.id, { CONNECT: true });
}

//* DOES'T ALLOW @everyone TO CONNECT
function makeNotJoinable(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.updateOverwrite(messageReaction.message.guild.id, { CONNECT: false });
}

//* SETS USER LIMIT TO 1
function limit1(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.setUserLimit(1);
}

//* SETS USER LIMIT TO 2
function limit2(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.setUserLimit(2);
}

//* SETS USER LIMIT TO 3
function limit3(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.setUserLimit(3);
}

//* SETS USER LIMIT TO 4
function limit4(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.setUserLimit(4);
}

//* SETS USER LIMIT TO 5
function limit5(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.setUserLimit(5);
}

module.exports = { makeInvisible, makeVisible, makeJoinable, makeNotJoinable, limit1, limit2, limit3, limit4, limit5 };