
const PingCommand = {
    description: 'Reply "pong"',
    action: pingAction
}

function pingAction({args}) {
    return 'pong';
}

exports.PingCommand = PingCommand;


const WibbleCommand = {
    description: 'Reply "wobble"',
    action: () => 'wobble'
}

exports.WibbleCommand = WibbleCommand;
