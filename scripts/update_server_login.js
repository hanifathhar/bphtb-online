const { Client } = require('ssh2');
const bcrypt = require('bcryptjs');

const jumpConfig = {
  host: '103.167.12.53',
  port: 22,
  username: 'root',
  password: '@#Tim1t42026',
  readyTimeout: 30000,
};

const targetConfig = {
  host: '192.168.1.101',
  port: 22,
  username: 'hnf',
  password: '@programmer',
  readyTimeout: 30000,
};

function runExec(client, cmd) {
  return new Promise((resolve, reject) => {
    client.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
      stream.on('data', (d) => {
        process.stdout.write(d);
        stdout += d.toString();
      });
      stream.stderr.on('data', (d) => {
        process.stderr.write(d);
        stderr += d.toString();
      });
    });
  });
}

async function updateServer() {
  const jumpClient = new Client();
  jumpClient.on('ready', () => {
    jumpClient.forwardOut(
      '127.0.0.1',
      12345,
      targetConfig.host,
      targetConfig.port,
      async (err, stream) => {
        if (err) {
          jumpClient.end();
          return console.error(err);
        }
        const targetClient = new Client();
        targetClient.on('ready', async () => {
          console.log('\n--- 1. UPDATE DB USERS WITH KNOWN PASSWORD (password123 & admin123) ---');
          const pass123 = bcrypt.hashSync('password123', 10);
          
          const updateSql = `
            PGPASSWORD=rahasia psql -h localhost -U postgres -d dbbphtb -c "
              UPDATE admin SET password = '${pass123}', status = 1, baned = 'N' WHERE username = 'admin';
              INSERT INTO admin (username, password, nm_pengguna, email, level, status, baned, role_name)
              VALUES 
                ('petugas_loket', '${pass123}', 'Rudi Haryanto (Loket)', 'loket@bphtb.daerah.go.id', 2, 1, 'N', 'PENDAFTARAN'),
                ('verifikator1', '${pass123}', 'Ahmad Fauzi (Verif 1)', 'verif1@bphtb.daerah.go.id', 3, 1, 'N', 'VERIFIKATOR_1'),
                ('verifikator2', '${pass123}', 'Siti Rahmawati (Verif 2)', 'verif2@bphtb.daerah.go.id', 4, 1, 'N', 'VERIFIKATOR_2'),
                ('verifikator3', '${pass123}', 'Drs. Hendra Gunawan (Verif 3)', 'verif3@bphtb.daerah.go.id', 5, 1, 'N', 'VERIFIKATOR_3'),
                ('bank_kasir', '${pass123}', 'Teller Bank Kasir', 'kasir@bankbpd.co.id', 6, 1, 'N', 'BANK'),
                ('notaris_budi', '${pass123}', 'Budi Santoso, S.H. (PPAT)', 'ppat@notaris.id', 7, 1, 'N', 'PPAT')
              ON CONFLICT (username) DO UPDATE SET password = '${pass123}', status = 1, baned = 'N';
              SELECT id, username, nm_pengguna, level, status, baned FROM admin;
            "
          `;
          await runExec(targetClient, updateSql);

          console.log('\n--- 2. PULL LATEST GIT CODE & REBUILD NEXTJS ---');
          const updateAppCmd = `
            cd /home/hnf/bphtb-online
            git reset --hard
            git pull origin main
            npm run build
            pm2 restart bphtb-online
            pm2 save
          `;
          await runExec(targetClient, updateAppCmd);

          console.log('\n--- 3. TEST LOGIN API WITH ADMIN:PASSWORD123 ---');
          await runExec(
            targetClient,
            `curl -i -X POST http://localhost:3006/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"password123"}'`
          );

          targetClient.end();
          jumpClient.end();
        });
        targetClient.connect({
          sock: stream,
          username: targetConfig.username,
          password: targetConfig.password,
        });
      }
    );
  });
  jumpClient.connect(jumpConfig);
}

updateServer();
