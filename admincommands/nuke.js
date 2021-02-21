module.exports = function nuke(message, loop = 0) {
    if (loop == 0)
        message.delete()

    var itemsProcessed = 0;

    message.channel.messages.fetch({
            limit: 100,
            before: message.id
        })
    .then(messages => messages.array().forEach(
        (message) => {
            itemsProcessed++;

            logger.log('warn', 'NUKING message: ' + message.content);
            message.delete()

            if (itemsProcessed === messages.array().length) {
                if (itemsProcessed == 100) {
                    logger.log('debug', "100 messages NUKED - total ~" + loop * 100 + " messages NUKED")
                    nuke(message, ++loop);
                } else {
                    logger.log('warn', "End reached ~" + ((loop * 100) + itemsProcessed) + " messages NUKED")
                }
            }
        }
    ));
}