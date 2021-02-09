module.exports = function word(message) {
	const args = message.content.split(' ');
	const mention = message.mentions.users.first();
	const db = database.db;

	if (args[2] == "?") {
		let selectSQL = `SELECT user_id, user_name, count(message) as count
		FROM messages
		WHERE message LIKE ? AND channel = ?
		GROUP BY user_id
		HAVING count > 1
		ORDER BY count DESC 
		LIMIT 10`;

		db.all(selectSQL, ['%' + args[1] + '%', message.channel.id], (err, rows) => {
			if (err) {
				throw err;
			} else {
				var result = ""
				for (var i = 0; (i < rows.length && i <= 10); i++) 
					result += `${rows[i]['user_name']} has said ${args[1]} ${rows[i]['count']} times! \n`
				
				const top = new discord.MessageEmbed()
					.setColor(config.color_hex)
					.setTitle(`Top 10 users for the word ${args[1]} in #${message.channel.name} `)
					.setDescription(result);

				message.channel.send(top);
			}
		})
	} else if (args[2] && mention) {
		let selectSQL = `SELECT LOWER(message) as message, COUNT(*) as count
		FROM messages
		WHERE message LIKE ? 
		AND channel = ? AND user_id = ? `;

		db.get(selectSQL, ['%' + args[2] + '%', message.channel.id, mention.id], (err, row) => {
			if (err) 
				throw err;
			else 
				message.channel.send('Ive found ' + row['count'] + ' messages from ' + mention.username + ' in this channel that contain ' + args[2]);
		})
	} else {
		let selectSQL = `SELECT LOWER(message) as message, COUNT(*) as count
		FROM messages
		WHERE message LIKE ?AND channel = ? `;

		db.get(selectSQL, ['%' + args[1] + '%', message.channel.id], (err, row) => {
			if (err)
				throw err;
			else 
				message.channel.send('Ive found ' + row['count'] + ' messages in this channel that contain ' + args[1]);
		})
	}
}