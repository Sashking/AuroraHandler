const { Client, Message, MessageEmbed } = require('discord.js');
const GeneratorSchema = require('../models/generator-schema');

module.exports = {
    name: 'create-generator',
    aliases: ['generator-create'],
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async(client, message, args) => {
        if (!message.member.hasPermission('MANAGE_CHANNELS')) return;

        await GeneratorSchema.findOneAndDelete({ Guild: message.guild.id });

        /** CREATE PRIVATE VOICE CHAT CATEGORY */
        const privateVoiceChatCategory = await message.guild.channels.create('🔐 Приватные голосовые чаты', { type: 'category', });
        /** CREATE GENERATOR VOICE CHAT */
        const generatorVoiceChat = await message.guild.channels.create('🔊 VC Generator', { type: 'voice', });

        new GeneratorSchema({
            Guild: message.guild.id,
            Channel: generatorVoiceChat.id,
            Category: privateVoiceChatCategory.id,
        }).save();

        const successEmbed = new MessageEmbed()
            .setTitle(`Создан новый генератор и категория для приватных каналов.`)
            .setDescription(`Присоединитесь к ${generatorVoiceChat}, чтобы создать приватный голосовой канал.`)
            .setColor('00D166')
        message.channel.send(successEmbed);
    }
}