const { Client, Message, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ping',
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    run: async(client, message, args) => {
        message.channel.send("Pinging...").then(msg => {
            var ping = msg.createdTimestamp - message.createdTimestamp;

            var embed = new MessageEmbed()
                .setTitle(`Пинг: \`${ping}мс\``)
                .setColor('00D166')
            
            msg.edit(embed)
        });
    }
}