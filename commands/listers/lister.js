const bot = require("systems/bot.js")

class Lister {
    constructor() {
        if (this.constructor === Lister) {
            throw new Error("Can't instantiate abstract class!")
        }
    }

    process(message) {
        const mentioned = message.mentions.users.first()
        const args = message.content.split(" ")
        const page = (args[2] ? args[2] - 1 : 0)

        if (args.length === 1) {
            this.total(message, page)
        } else if (mentioned) {
            this.mention(message, mentioned, page)
        } else if (args[1] === "?") {
            this.perPerson(message, page)
        } else if (args[1] === "%") {
            this.percentage(message, page)
        } else {
            bot.message.reply(message, "Incorrect format")
        }
    }

    total(message) {
        bot.message.reply(message, "This command does not work without further commands")
    }

    mention(message) {
        bot.message.reply(message, "This command does not work with @")
    }

    perPerson(message) {
        bot.message.reply(message, "This command does not work with ?")
    }

    percentage(message) {
        bot.message.reply(message, "This command does not work with %")
    }
}

module.exports = Lister