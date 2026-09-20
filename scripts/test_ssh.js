const { Client } = require('ssh2');

const jumpConfig = {
  host: '103.167.12.53',
  port: 22,
  username: 'root',
  password: '@#Tim1t42026'
};

const targetConfig = {
  host: '192.168.1.101',
  port: 22,
  username: 'hnf',
  password: '@programmer'
};

function executeRemote() {
  const jumpConn = new Client();

  jumpConn.on('ready', () => {
    console.log('Jump host connected successfully.');
    jumpConn.forwardOut(
      '127.0.0.1',
      12345,
      targetConfig.host,
      targetConfig.port,
      (err, stream) => {
        if (err) {
          console.error('Jump forwardOut error:', err);
          return jumpConn.end();
        }

        const targetConn = new Client();
        targetConn.on('ready', () => {
          console.log('Target host connected successfully via jump host!');
          
          targetConn.exec('uname -a && whoami && pwd && node -v && npm -v && pm2 -v', (err, execStream) => {
            if (err) {
              console.error('Exec error:', err);
              targetConn.end();
              jumpConn.end();
              return;
            }
            execStream.on('close', (code, signal) => {
              console.log('Command closed with code:', code);
              targetConn.end();
              jumpConn.end();
            }).on('data', (data) => {
              console.log('STDOUT:\n' + data.toString());
            }).stderr.on('data', (data) => {
              console.error('STDERR:\n' + data.toString());
            });
          });
        });

        targetConn.on('error', (err) => {
          console.error('Target connection error:', err);
          jumpConn.end();
        });

        targetConn.connect({
          sock: stream,
          username: targetConfig.username,
          password: targetConfig.password
        });
      }
    );
  });

  jumpConn.on('error', (err) => {
    console.error('Jump host error:', err);
  });

  jumpConn.connect(jumpConfig);
}

executeRemote();
