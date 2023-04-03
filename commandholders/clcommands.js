let commands = {
    'say': require('../commandline/say.js'),
    'list': require('../commandline/list.js'),
    'save': require('../commandline/save.js'),
    'exit': require('../commandline/exit.js'),
    'erase': require('../commandline/erase.js'),
    'clear': require('../commandline/clear.js'),
    'help': require('../commandline/help.js'),
    'scan': require('../commandline/scan.js'),
    'saveemotes': require('../commandline/saveemotes.js'),
    'vacuum': require('../commandline/vacuum.js'),
    'cleanwebhooks': require('../commandline/cleanwebhooks.js'),
    'webhooks': require('../commandline/webhooks.js'),
    'match': require('../commandline/match.js'),
    'report': require('../commandline/report.js')
}

module.exports = commands