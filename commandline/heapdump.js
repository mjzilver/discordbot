const heapdump = require("heapdump")
const path = require("path")
const logger = require("systems/logger.js")

module.exports = {
    name: "heapdump",
    description: "dumps the heap to a file",
    format: "heapdump",
    function: () => {
        const filename = `heapdump-${Date.now()}.heapsnapshot`
        const filePath = path.join(__dirname, "..", "backups", filename)
        heapdump.writeSnapshot(filePath, (err, filename) => {
            if (err) {
                logger.error(`Heapdump failed: ${err}`)
            } else {
                logger.console(`Heapdump written to ${filename}`)
            }
        })
    }
}