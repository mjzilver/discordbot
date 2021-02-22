class Bot {
	constructor() {
		this.commands = require('./commands.js');
		this.admincommands = require('./admincommands.js');
		this.fs = require('fs')
		
		// person as key -> time as value
		this.lastRequest = [];

		this.messageCounter = 0;
		this.lastMessageSent = new Date();
	
		this.bot = new discord.Client({
			autoReconnect: true
		})
	
		this.bot.on('ready', () => {
			this.bot.user.setPresence({ activity: { name: `Running Version ${global.package.version}` }})
			logger.info('Connected');
			logger.info(`Logged in as: ${this.bot.user.username} - ${this.bot.user.id}`);
			logger.info(`Running Version ${global.package.versionname} - ${global.package.version}`);
		});

		this.bot.login(config.discord_api_key);

		this.bot.on('error', function (error) {
			logger.error(error.message);
		});

		this.bot.on('message', message => {
			database.storemessage(message);

			// look for the b! meaning bot command
			if (message.content.match(new RegExp(config.prefix, "i")) && !message.author.equals(bot.user)) {
				message.content = message.content.replace(new RegExp(config.prefix, "i"), '');
				message.content = message.content.normalizeSpaces()
				const args = message.content.split(' ');
				const command = args.shift().toLowerCase();

				logger.log('debug', `'${message.author.username}' issued '${command}'${args.length >= 1 ? ` with arguments '${args}'` : ''} in channel '${message.channel.name}' in server '${message.channel.guild.name}'`);

				if(this.isUserAllowed(message) || message.member.hasPermission("ADMINISTRATOR"))
				{
					if(command in this.commands) {
						return this.commands[command](message);
					} else if(message.author.id === config.owner) {
						if(command in this.admincommands)
							return this.admincommands[command](message);
					} else {
						message.author.send(`${command.capitalize()} is not a command, retard`)
					}
				} 
			} else if(!message.author.bot) {
				var currentTimestamp = new Date();
				var timepassed = new Date(currentTimestamp.getTime() - this.lastMessageSent.getTime()).getMinutes();

				if((this.messageCounter >= config.speakEvery || randomBetween(1,20) == 1) && timepassed >= randomBetween(10,20)) {
					this.commands['speak'](message);
					this.lastMessageSent = currentTimestamp;
					this.messageCounter = 0;
				} else if (message.content.match(new RegExp(/\bbot(je)?\b/, "gi"))) {
					if(this.isUserAllowed(message))
						this.commands['speak'](message);
				}
				this.messageCounter++;
			}
		})

		this.bot.on('messageDelete', message => {
			logger.log('warn', `This Message has been deleted: ${message.author.username}: ${message.content} == Send at: ${new Date(message.createdTimestamp).toUTCString()}`);

			if(message.edits.length > 1)
			{
				message.edits.forEach(edit => {
					logger.log('warn', `This edit belongs to ${message.author.username}: ${message.content} == Edit at: ${edit.content} ${new Date(message.editedTimestamp).toUTCString()}`);
				});
			}
		})
	}	
	
	isUserAllowed(message) {
		var disallowed = JSON.parse(this.fs.readFileSync('./json/disallowed.json'));
		if(message.author.id in disallowed) {
			message.author.send(`You aren't allowed to use botje because you are on the banlist.`)
			return false
		}
		var currentTimestamp = new Date();

		if (!(message.author.username in this.lastRequest)) {
			this.lastRequest[message.author.username] = currentTimestamp;
		} else {
			if ((currentTimestamp - this.lastRequest[message.author.username] < (config.timeoutDuration * 1000))) {
				var difference = new Date(currentTimestamp.getTime() - this.lastRequest[message.author.username].getTime());
				message.channel.send(`You need to wait ${(config.timeoutDuration - difference.getSeconds())} seconds`)
				return false;
			} else {
				this.lastRequest[message.author.username] = currentTimestamp;
			}
		}
		return true;
	}
}
module.exports = new Bot();