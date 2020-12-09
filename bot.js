class Bot {
	constructor() {
		this.commands = require('./commands.js');
		this.admincommands = require('./admincommands.js');
		
		// person as key -> time as value
		this.lastRequest = [];
		// adding the timer (so the timeout stacks)
		this.lastRequestTimer = [];
	
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
			var channel = message.channel

			database.storemessage(message);

			// look for the b! meaning bot command
			if (message.content.match(new RegExp(config.prefix, "i")) && !message.author.equals(bot.user))  {
				message.content = message.content.replace(new RegExp(config.prefix, "i"), '');
				const args = message.content.split(' ');
				const command = args.shift().toLowerCase();

				var allowed = true;

				var currentTimestamp = new Date();

				if (!(message.author.username in this.lastRequest) || message.member.hasPermission("ADMINISTRATOR")) {
					this.lastRequest[message.author.username] = currentTimestamp;
				} else {
					// set timer
					this.lastRequestTimer[message.author.username] = (message.author.username in this.lastRequestTimer) ? this.lastRequestTimer[message.author.username] : 5;
					var currentTimer = this.lastRequestTimer[message.author.username];

					if ((currentTimestamp - this.lastRequest[message.author.username] < (currentTimer * 1000))) {
						this.lastRequestTimer[message.author.username] = currentTimer + 5;

						var diff = new Date(currentTimestamp.getTime() - this.lastRequest[message.author.username].getTime());
						if (currentTimer == 5)
							channel.send('You need to wait ' + (currentTimer - diff.getSeconds()) + ' seconds')
						else
							channel.send('You need to wait ' + (currentTimer - diff.getSeconds()) + ' seconds, added 5 seconds because you didnt wait')

						allowed = false;
					} else {
						this.lastRequestTimer[message.author.username] = 5;
						this.lastRequest[message.author.username] = currentTimestamp;
					}
				}

				logger.log('debug', message.author.username + ' requested ' + command + ' with arguments ' + args);

				if(allowed)
					if(command in this.commands)
						return this.commands[command](message);

				// only me for now
				if(message.author.id === config.owner)
					if(command in this.admincommands)
						return this.admincommands[command](message);
			}
		})

		this.bot.on('messageDelete', message => {
			logger.log('warn', `This Message has been deleted: ${message.author.username}: ${message.content} == Send at: ${new Date(message.createdTimestamp).toUTCString()}`);

			if(message.edits.length > 1)
			{
				message.edits.forEach(edit => {
					logger.log('warn', `This edit belongs to ${message.author.username}: ${message.content} == Edit at: ${edit.content}  ${new Date(message.editedTimestamp).toUTCString()}`);
				});
			}
		})
	}	
}
module.exports = new Bot();