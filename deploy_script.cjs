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

const jumpClient = new Client();

jumpClient.on('ready', () => {
  console.log('Connected to Jump Host (103.167.12.53)');
  jumpClient.forwardOut(
    '127.0.0.1',
    12345,
    targetConfig.host,
    targetConfig.port,
    (err, stream) => {
      if (err) {
        console.error('ForwardOut error:', err);
        return jumpClient.end();
      }

      const targetClient = new Client();
      targetClient.on('ready', () => {
        console.log('Connected to Target VM (192.168.1.101)');
        
        const commands = [
          'cd /home/hnf/bphtb-online',
          'git pull origin main',
          'npm run build',
          'pm2 restart bphtb-online || pm2 restart all'
        ].join(' && ');

        console.log('Running deploy commands on VM...');
        targetClient.exec(commands, (err, execStream) => {
          if (err) {
            console.error('Exec error:', err);
            targetClient.end();
            jumpClient.end();
            return;
          }

          execStream.on('close', (code, signal) => {
            console.log(`Command closed with code ${code}`);
            targetClient.end();
            jumpClient.end();
          }).on('data', (data) => {
            process.stdout.write(data.toString());
          }).stderr.on('data', (data) => {
            process.stderr.write(data.toString());
          });
        });
      });

      targetClient.on('error', (err) => {
        console.error('Target client error:', err);
      });

      targetClient.connect({
        sock: stream,
        username: targetConfig.username,
        password: targetConfig.password
      });
    }
  );
});

jumpClient.on('error', (err) => {
  console.error('Jump client error:', err);
});

jumpClient.connect(jumpConfig);
