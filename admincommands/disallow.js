var filepath = './json/disallowed.json';

module.exports = function disallow(message) {
    const mention = message.mentions.users.first();
    const args = message.content.split(' ');

    var disallowed = JSON.parse(fs.readFileSync(filepath));

    if (args[2] && args[2] == "remove") {
        delete disallowed[mention.id];
        logger.log('warn', `${mention.username} is now allowed to use the bot again`)
    } else if (mention) {
        disallowed[mention.id] = true;
        logger.log('warn', `${mention.username} is no longer allowed to use the bot`)
    } else {
        return message.channel.send('You need to @ someone to disallow them')
    }

    fs.writeFile(filepath, JSON.stringify(disallowed), function (err) {
        if (err)
            logger.log('error', err)
    });
}