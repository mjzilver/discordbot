function calculateSyllables(message) {
    var message = message.replace(/e /i)
    var message = message.replace(/ y/i)
    var score = message.match(/(?:[aeiouy]{1,2})/gi)
    return score ? score.length : 0
}

module.exports = {
    'name': 'syllables',
    'description': 'shows the top 10 users with the most syllables per post in the current channel or from mentioned user',
    'format': 'syllables (@user)',
    'function': function syllables(message) {
        const mention = message.mentions.users.first()
        const db = database.db

        if (!mention) {
            let selectSQL = `SELECT user_id, user_name, message
            FROM messages 
            WHERE server = ${message.guild.id}
            ORDER BY user_id`

            var userdata = {}

            db.all(selectSQL, [], (err, rows) => {
                if (err) {
                    throw err
                } else {
                    for (var i = 0; i < rows.length; i++) {
                        var user_name = rows[i]['user_name']

                        if (!userdata[user_name])
                            userdata[user_name] = {
                                'syllables': 0,
                                'total': 0,
                                'average': 0
                            }

                        var syllables = calculateSyllables(rows[i]['message'])
                        if (syllables >= 1) {
                            userdata[user_name]['syllables'] += syllables
                            userdata[user_name]['total'] += 1
                        }
                    }

                    var sorted = []
                    for (var user in userdata) {
                        // magical calculation
                        userdata[user]['average'] = Math.round(userdata[user]['syllables'] / userdata[user]['total'])
                        sorted.push([user, userdata[user]['average']])
                    }

                    sorted.sort(function (a, b) {
                        return b[1] - a[1];
                    })

                    var result = ""
                    for (var i = 0;
                        (i < sorted.length && i <= 10); i++)
                        result += `${sorted[i][0]} has an average of ${sorted[i][1]} syllables per post \n`

                    const top = new discord.MessageEmbed()
                        .setColor(config.color_hex)
                        .setTitle(`Top 10 most intellectual posters in ${message.guild.name}`)
                        .setDescription(result)

                    message.channel.send({embeds: [top]})
                }
            })
        } else {
            let selectSQL = `SELECT user_id, user_name, message
            FROM messages 
            WHERE server = ${message.guild.id} AND user_id = ${mention.id} `

            var userdata = {
                'syllables': 0,
                'total': 0,
                'average': 0
            }

            db.all(selectSQL, [], (err, rows) => {
                if (err) {
                    throw err
                } else {
                    for (var i = 0; i < rows.length; i++) {
                        var syllables = calculateSyllables(rows[i]['message'])
                        if (syllables >= 1) {
                            userdata['syllables'] += syllables
                            userdata['total'] += 1
                        }
                    }

                    userdata['average'] = Math.round(userdata['syllables'] / userdata['total'])

                    message.channel.send(`${mention.username} has an average of ${userdata['average']} syllables per post`)
                }
            })
        }
    }
}