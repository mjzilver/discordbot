let request = require('request')
let discord = require('discord.js')
let config = require('../config.json')
let database = require('../systems/database.js')

module.exports = {
    'name': 'reddit',
    'description': 'gets a random link from the given subreddit use top|hot|new to sort and the timeframe (only for top)',
    'format': 'reddit [subreddit] (top|hot|new) (hour|day|week|month|year|all)',
    'function': async function getRedditImage(message, last = '') {
        const db = database.db
        const args = message.content.split(' ')
        let sub = args[1]
        let sort = 'hot'
        let time = 'month'

        if (['top', 'hot', 'new'].includes(args[2]))
            sort = args[2]
        if (['hour', 'day', 'week', 'month', 'year', 'all'].includes(args[3]))
            time = args[3]

        const options = {
            url: `https://www.reddit.com/r/${sub}/${sort}.json?sort=${sort}&t=${time}&limit=100&after=${last}`,
            json: true
        }

        request(options, (err, res, body) => {
            if (err) {
                return logger.error(err)
            }

            if (typeof (body) !== 'undefined' && typeof (body.data) !== 'undefined' && typeof (body.data.children) !== 'undefined') {
                let selectSQL = 'SELECT * FROM images WHERE sub = "' + sub + '"'
                let foundImages = {}

                db.all(selectSQL, [], async (err, rows) => {
                    if (err)
                        throw err

                    for (let i = 0; i < rows.length; i++)
                        foundImages[rows[i].link] = true

                    let filteredImages = []

                    for (let i = 0; i < body.data.children.length; i++)
                        if (!(body.data.children[i].data.url in foundImages) && body.data.children[i].data.url.isLink())
                            filteredImages.push(body.data.children[i])

                    if (filteredImages.length > 0) {
                        let chosen = Math.floor(Math.random() * filteredImages.length)
                        let post = filteredImages[chosen].data

                        if (post.url && post.url.isImage()) {
                            const image = new discord.MessageEmbed()
                                .setColor(`${config.color_hex}`)
                                .setTitle(`${post.title}`)
                                .addField('Updoots', `${post.score}`, true)
                                .addField('Posted by', `${post.author}`, true)
                                .setImage(`${post.url}`)
                                .setURL(`https://reddit.com${post.permalink}`)
                                .setFooter(`From: reddit/r/${sub}`)
                            bot.message.send(message, { embeds: [image] })
                        } else if (post.url.match(/v\.redd\.it/gi)) {
                            const options = {
                                url: post.url,
                                json: true,
                                followAllRedirects: true,
                            }

                            request(options, (err, res, body) => {
                                if (err)
                                    throw err

                                logger.console(`Redirected to ${res.request.uri.href}`)

                                const options = {
                                    url: res.request.uri.href + ".json",
                                    json: true,
                                }

                                request(options, (err, res, body) => {
                                    let videolink = body[0].data.children[0].data.secure_media.reddit_video.fallback_url

                                    bot.message.send(message, `${post.title} \n${videolink} \n<https://reddit.com${post.permalink}>`)
                                })
                            })
                        } else {
                            bot.message.send(message, `${post.title} \n${post.url} \n<https://reddit.com${post.permalink}>`)
                        }

                        let insert = db.prepare('INSERT INTO images (link, sub) VALUES (?, ?)', [post.url, sub])
                        insert.run(function (err) {
                            if (err) {
                                logger.error(`failed to insert: ${post.url} - ${sub}`)
                                logger.error(err)
                            } else
                                logger.debug(`inserted: ${post.url} - ${sub}`)
                        })
                    } else {
                        if (body.data.children.length >= 100) {
                            logger.debug('Finding posts before post ' + body.data.children[body.data.children.length - 1].data.title)
                            getRedditImage(message, body.data.children[body.data.children.length - 1].data.name)
                        } else
                            bot.message.send(message, "I have ran out of images to show you")
                    }
                })
            } else
                bot.message.send(message, "No images were found")
        })
    }
}