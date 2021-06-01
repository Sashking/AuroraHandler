const client = require('../index');
const prefix = require('../config.json').prefix;
const { Collection } = require('discord.js');
const cooldown = new Collection();
const ms = require('ms');

client.on('message', async (message) => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
	if (!message.guild) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	if (cmd.length == 0) return;
	let command = client.commands.get(cmd);
	if (!command) command = client.commands.get(client.aliases.get(cmd));
	if (command) {
		if (command.cooldown) {
			if (cooldown.has(`${command.name}${message.author.id}${message.guild.id}`))
				return message.channel.send( `You can't use this command for \`${ms(cooldown.get(`${command.name}${message.author.id}${message.guild.id}`) - Date.now(), { long: true }) }\`.` );
			command.run(client, message, args);
			cooldown.set(`${command.name}${message.author.id}${message.guild.id}`, Date.now() + command.cooldown);
			setTimeout(() => {
				cooldown.delete(`${command.name}${message.author.id}${message.guild.id}`);
			}, command.cooldown);
		} else command.run(client, message, args);
	}
});
