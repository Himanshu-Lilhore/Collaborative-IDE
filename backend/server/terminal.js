const os = require('os');
const pty = require('node-pty');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    // cols: 10,
    rows: 10,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env,
});

module.exports = { ptyProcess };