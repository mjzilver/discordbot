module.exports = async function nuke(message) {
    if (message.author.id == message.guild.ownerId) {
        const filter = launchMessage => {
            return (launchMessage.content.startsWith('launch') && launchMessage.author.id == message.author.id)
        }

        message.channel.awaitMessages({ filter, max: 1, time: 60000 })
            .then(collected => {
                bot.message.send(message, `Nuke launched. Blowout soon, fellow stalker.`)
                nukeguild(message)
            })
        bot.message.send(message, "Nuke armed to confirm launch type 'launch' to launch the nuke, this cannot be cancelled.")
    } else {
        bot.message.send(message, "Only the server owner may send the nuke.")
    }
}

function nukeguild(message) {
    for (const [channelId, channel] of bot.client.channels.cache.entries())
        if (channel.type == "GUILD_TEXT" && channel.guild.id == message.guild.id)
            nukechannel(channelId)
}

function nukechannel(channelId) {
    let channels = bot.client.channels.cache
    let channel = channels.find(c => c.id === channelId)

    if (channel && channel.type == "GUILD_TEXT") {
        nukemessages(channel, channel.lastMessageId)
        channel.lastMessage?.delete({ timeout: 100 })
        logger.deletion(`NUKING channel: ${channel.name}`)
    } else
        logger.console('Channel not found')
}

function nukemessages(channel, messageid, loop = 0) {
    let itemsProcessed = 0

    channel.messages.fetch({
        limit: 100,
        before: messageid
    }).then(messages => messages.forEach(
        (message) => {
            itemsProcessed++
            message?.delete({ timeout: 10 })

            if (itemsProcessed === messages.size) {
                if (itemsProcessed == 100) {
                    logger.deletion(`100 messages scanned to nuke continuing - total ${((loop * 100) + itemsProcessed)} messages from ${channel.name} in ${channel.guild.name}`)
                    nukemessages(channel, message.id, ++loop)
                } else
                    logger.deletion(`End reached ${((loop * 100) + itemsProcessed)} messages scanned to nuke from ${channel.name} in ${channel.guild.name}`)
            }
        }
    ))
}