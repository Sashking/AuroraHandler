const client = require('../index');
const GeneratorSchema = require('../models/generator-schema');
const voiceChannelSystem = require('../events/voiceChannelSystem');

client.on('messageReactionAdd', (messageReaction, user) => {
    if (user.id === client.user.id) return;

    GeneratorSchema.findOne({ Guild: messageReaction.message.guild.id }, (err, data) => {
        if (!data) return;
    })

    switch (messageReaction.emoji.name) {
        case '👻':
            voiceChannelSystem.makeInvisible(messageReaction, user);
            break;
        case '👁':
            voiceChannelSystem.makeVisible(messageReaction, user);
            break;
        case '🔒':
            voiceChannelSystem.makeNotJoinable(messageReaction, user)
            break;
        case '🔓':
            voiceChannelSystem.makeJoinable(messageReaction, user);
            break;
        case '1️⃣':
            voiceChannelSystem.limit1(messageReaction, user);
            break;
        case '2️⃣':
            voiceChannelSystem.limit2(messageReaction, user);
            break;
        case '3️⃣':
            voiceChannelSystem.limit3(messageReaction, user);
            break;
        case '4️⃣':
            voiceChannelSystem.limit4(messageReaction, user);
            break;
        case '5️⃣':
            voiceChannelSystem.limit5(messageReaction, user);
            break;
        case '0️⃣':
            voiceChannelSystem.removeLimit(messageReaction, user);
            break;
        case '🔴':
            voiceChannelSystem.bitrateLow(messageReaction, user);
            break;
        case '🟠':
            voiceChannelSystem.bitrateMiddle(messageReaction, user);
            break;
        case '🟢':
            voiceChannelSystem.bitrateHigh(messageReaction, user);
            break;
    }
})