const { Client, Message, MessageEmbed } = require('discord.js');
const GeneratorSchema = require('../models/generator-schema');

module.exports = {
    name: 'generator',
    aliases: [],
    description: '',
    usage: '',
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async(client, message, args) => {
        if (args[0] === 'create') {
            await GeneratorSchema.findOneAndDelete({ Guild: message.guild.id });

            /** CREATE PRIVATE VOICE CHAT CATEGORY */
            const privateVoiceChatCategory = await message.guild.channels.create('🔐 Private Voice Chats', { type: 'category', });
            /** CREATE GENERATOR VOICE CHAT */
            const generatorVoiceChat = await message.guild.channels.create('🔊 VC Generator', { type: 'voice', });

            new GeneratorSchema({
                Guild: message.guild.id,
                Channel: generatorVoiceChat.id,
                Category: privateVoiceChatCategory.id,
            }).save();

            message.channel.send(`Created new generator and a category for private channels.`);
        }
    }
}