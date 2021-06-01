const { readdirSync } = require('fs');
const ascii = require('ascii-table');
let table = new ascii('📖  Commands');
table.setHeading('📟  Command', '🔋  Load status');

module.exports = (client) => {
	const commands = readdirSync(`./commands/`).filter((file) =>
		file.endsWith('.js')
	);
	for (let file of commands) {
		let pull = require(`../commands/${file}`);
		if (pull.name) {
			client.commands.set(pull.name, pull);
			table.addRow(file, '✅  Loaded!');
		} else {
			table.addRow(
				file,
				'❌  ->  Missing a help.name, or help.name is not a string.'
			);
			continue;
		}
		if (pull.aliases && Array.isArray(pull.aliases))
			pull.aliases.forEach((alias) =>
				client.aliases.set(alias, pull.name)
			);
	}
	console.log(table.toString());

	readdirSync('./events/').forEach(() => {
		const events = readdirSync('./events/').filter((file) =>
			file.endsWith('.js')
		);

		for (let file of events) {
			let pull = require(`../events/${file}`);

			if (pull.name) {
				client.events.set(pull.name, pull);
			} else {
				continue;
			}
		}
	});
};
