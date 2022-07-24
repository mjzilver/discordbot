class Bot {
    constructor() {
        this.client = new discord.Client({
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_BANS',
                'GUILD_EMOJIS_AND_STICKERS',
                'GUILD_INTEGRATIONS',
                'GUILD_WEBHOOKS',
                'GUILD_INVITES',
                'GUILD_VOICE_STATES',
                'GUILD_PRESENCES',
                'GUILD_MESSAGES',
                'GUILD_MESSAGE_REACTIONS',
                'GUILD_MESSAGE_TYPING',
            ],
            autoReconnect: true
        })

        this.client.on('ready', () => {
            this.client.user.setPresence({
                activities: [{
                    name: `Running Version ${global.package.version}`
                }]
            })
            logger.console(`Logged in as: ${this.client.user.username} - ${this.client.user.id}`)
            logger.console(`Running Version ${global.package.version}`)
        })

        this.client.login(config.discord_api_key)

        this.client.on('error', function (error) {
            logger.error(error.message)
        })

        this.client.on('messageCreate', message => {
            database.storeMessage(message)
            command.handleCommand(message)
        })

        this.client.on('messageDelete', message => {
            logger.admin(`This Message has been deleted: ${message.author.username}: ${message.content} == Posted in channel '${message.channel.name}' in server '${message.channel.guild.name} == Send at: ${new Date(message.createdTimestamp).toUTCString()}`)
        })

        this.client.on('emojiCreate', emoji => {
            backupsystem.saveEmoji(emoji)
        })

        this.client.on('emojiDelete', emoji => {
            backupsystem.saveEmoji(emoji, new Date().getTime())
        })

        this.client.on('emojiUpdate', (oldEmoji, newEmoji) => {
            backupsystem.saveEmoji(oldEmoji, new Date().getTime())
            backupsystem.saveEmoji(newEmoji)
        })
    }
}
module.exports = new Bot()