const path = './emotes'

module.exports = function saveemotes(input) {
    console.log('Emotes are being saved')

    for (const [guildID, guild] of bot.client.guilds.cache.entries()) {
        var guildpath = path + '/' + guildID

        if (!fs.existsSync(guildpath))
            fs.mkdirSync(guildpath)

        for (const [emojiID, emoji] of guild.emojis.cache.entries())
            backupsystem.saveEmoji(emoji)
    }
}