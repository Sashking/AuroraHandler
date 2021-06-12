const { MessageEmbed } = require('discord.js');
const prefix = require('../config.json').prefix;

module.exports = {
	name: 'help',
	aliases: ['h'],
	/**
	 * @param {Client} client
	 * @param {Message} message
	 * @param {String[]} args
	 */
	run: async (client, message, args) => {
		const helpEmbed = new MessageEmbed();
		helpEmbed.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }));
        helpEmbed.setTitle(`Префикс: \`${prefix}\``)
		helpEmbed.addFields(
			{
				name: '` create-generator `',
				value: `Создаёт генератор и категорию для голосовых чатов`,
				inline: true,
			},
			{
				name: '` ping `',
				value: `Показывает текущий пинг бота`,
				inline: true,
			},
            {
				name: '` help `',
				value: `Список и описание всех доступных команд`,
				inline: true,
			},
		);
		helpEmbed.setColor('F8C300');
		helpEmbed.setTimestamp();

		message.channel.send(helpEmbed);
	},
};