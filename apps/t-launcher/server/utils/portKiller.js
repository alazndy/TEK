const { exec } = require('child_process');
const os = require('os');

const isWin = os.platform() === 'win32';

/**
 * Checks if a port is in use and returns the PID if so.
 * @param {number} port 
 * @returns {Promise<number|null>} PID or null
 */
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const cmd = isWin 
      ? `netstat -ano | findstr :${port}`
      : `lsof -i:${port} -t`;

    exec(cmd, (err, stdout) => {
      if (err || !stdout) {
        resolve(null);
        return;
      }
      
      // Parse PID
      // Windows: TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
      // Unix: 12345
      const lines = stdout.trim().split('\n');
      if (lines.length === 0) {
        resolve(null);
        return;
      }
      
      const parts = lines[0].trim().split(/\s+/);
      const pid = isWin ? parts[parts.length - 1] : parts[0];
      
      resolve(parseInt(pid, 10) || null);
    });
  });
};

/**
 * Kills the process with the given PID.
 * @param {number} pid 
 * @returns {Promise<boolean>} success
 */
const killPid = (pid) => {
  return new Promise((resolve) => {
    try {
        process.kill(pid, 'SIGKILL'); // Force kill
        resolve(true);
    } catch (e) {
        // Fallback to exec command if permission denied or other error
        const cmd = isWin ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
        exec(cmd, (err) => {
            resolve(!err);
        });
    }
  });
};

module.exports = { checkPort, killPid };
