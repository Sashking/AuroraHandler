const { Collection, Client, Discord, Message } = require('discord.js');
const client = new Client({ disableEveryone: true, });
const fs = require('fs');
const config = require('./config.json');
const token = config.token;

const mongo = require('mongoose');
mongo.connect('mongodb+srv://sashking:CKClaMymukmhu5TC@cluster0.x9m9t.mongodb.net/data', { useUnifiedTopology: true, useNewUrlParser: true, })
	.then(console.log('💾 Connected to MongoDB!'));

module.exports = client;

client.prefix = config.prefix;
client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync('./commands/');
['command'].forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

client.login(token);