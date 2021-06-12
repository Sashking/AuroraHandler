const { Collection, MessageEmbed } = require('discord.js');
const ms = require('ms');
const GeneratorSchema = require('../models/generator-schema');
const voiceCollection = new Collection();
const chatCollection = new Collection();
const cooldown = new Collection();
const client = require('../index');

client.on('voiceStateUpdate', async (oldState, newState) => {
    const user = await client.users.fetch(newState.id);
    const member = newState.guild.member(user);

    let generatorID = '';
    let categoryID = '';

    await GeneratorSchema.findOne({ Guild: newState.guild.id }, async (err, data) => {
        if (data) {

            if (newState.guild.channels.cache.find(c => c.id == data.Channel)) generatorID = data.Channel;
            else if (newState.guild.channels.cache.find(c => c.id == data.Channel) == undefined) {
                data.Channel = '';
                data.save();
                return;
            }
            if (newState.guild.channels.cache.find(c => c.id == data.Category)) categoryID = data.Category;
            else if (newState.guild.channels.cache.find(c => c.id == data.Category) == undefined) {
                data.Channel = '';
                data.save();
                return;
            }
        }
    })

    if (!oldState.channel && newState.channel.id === generatorID) {

        if (cooldown) {
            if (cooldown.has(`${newState.member.user.id}${newState.guild.id}`))
                return newState.member.send(
                    new MessageEmbed()
                        .setAuthor(newState.member.user.username, newState.member.user.displayAvatarURL({ dynamic: true }))
                        .setDescription(`Вы не можете создать новый канал в течение \`${ms(cooldown.get(`${newState.member.user.id}${newState.guild.id}`) - Date.now(), { long: false }) }\``)
                        .setColor('F93A2F')
                        .setTimestamp()
                )
            
            cooldown.set(`${newState.member.user.id}${newState.guild.id}`, Date.now() + 20000);
            setTimeout(() => {
                cooldown.delete(`${newState.member.user.id}${newState.guild.id}`);
            }, 20000);
        }

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

        const embed1 = new MessageEmbed()
            .setTitle('Основные настройки')
            .setDescription('👻 сделать канал невидимым на сервере\n\n👁 сделать канал видимым\n\n🔒 заблокировать вход для других пользователей\n\n🔓 разблокировать вход для других пользователей')
            .setColor('00D166')
        const embed2 = new MessageEmbed()
            .setTitle('Ограничение на количество пользователей')
            .setDescription('0️⃣ убрать ограничение на количество пользователей\n\n1️⃣ - 5️⃣ ограничение на количество пользователей')
            .setColor('00D166')
        const embed3 = new MessageEmbed()
            .setTitle('Настройки качества звука')
            .setDescription('🔴 низкое качество звука\n\n🟠 среднее качество звука\n\n🟢 высокое качество звука')
            .setColor('00D166')

        chat.send(`<@${user.id}>`, embed1)
            .then((embed) => {
                embed.react('👻'); // make invisible
                embed.react('👁'); // make visible
                embed.react('🔒'); // do not allow users to join
                embed.react('🔓'); // allows users to join
            })
        chat.send(embed2)
            .then((embed) => {
                embed.react('0️⃣'); // remove user limit
                embed.react('1️⃣'); // user limit: 1
                embed.react('2️⃣'); // user limit: 2
                embed.react('3️⃣'); // user limit: 3
                embed.react('4️⃣'); // user limit: 4
                embed.react('5️⃣'); // user limit: 5
            })
        
        chat.send(embed3)
            .then((embed) => {
                embed.react('🔴'); // sound quality: low
                embed.react('🟠'); // sound quality: medium
                embed.react('🟢'); // sound quality: high
            })

    } else if (newState.channel ? newState.channel.id : '' != voiceCollection.get(user.id)) {

        if (!oldState.channel) return;

        if (oldState.channel.id === voiceCollection.get(newState.id)) {
            oldState.channel.delete(); // delete voice chat

            const embed = new MessageEmbed()
                .setDescription(`⚠ Канал будет удалён через \`12с\``)
                .setColor('F93A2F')
            newState.guild.channels.cache.get(chatCollection.get(newState.id)).send(embed);

            setTimeout(function() { deleteTextChannel(newState) }, 12 * 1000) // delete text chat (after 12 seconds)
            return;
        }

        function deleteTextChannel(chat) {
            if (!chat.guild.channels.cache.get(chatCollection.get(chat.id))) return;
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

//* SETS USER LIMIT TO 5
function removeLimit(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.setUserLimit(0);
}

//* SETS LOW BITRATE
function bitrateLow(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.edit({ bitrate: 8000 });
}

//* SETS MIDDLE BITRATE
function bitrateMiddle(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.edit({ bitrate: 64000 });
}

//* SETS HIGH BITRATE
function bitrateHigh(messageReaction, user) {
    const vc = messageReaction.message.guild.channels.cache.get(voiceCollection.get(user.id));
    if (vc) vc.edit({ bitrate: 96000 });
}

module.exports = { makeInvisible, makeVisible, makeJoinable, makeNotJoinable, limit1, limit2, limit3, limit4, limit5, removeLimit, bitrateLow, bitrateMiddle, bitrateHigh };