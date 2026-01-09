const si = require('systeminformation');
const { killPid } = require('../utils/portKiller');

/**
 * Get list of active ports and processes
 */
const getPorts = async (req, res) => {
  try {
    // Get network connections (ports)
    const connections = await si.networkConnections();
    
    // Filter for LISTENING state and meaningful ports (e.g., > 1024 generally, but showing all is safer for "Port Manager")
    // We mainly want to show what is listening.
    const listeningPorts = connections.filter(conn => conn.state === 'LISTEN');

    // Enhance with process details if possible. 
    // networkConnections already returns PID and Process Name on many systems if run with privileges.
    // If we need more detail, we could use si.processes(), but connection info is usually enough.
    
    // Map to cleaner format
    const result = listeningPorts.map(conn => ({
      pid: conn.pid,
      process: conn.process,
      port: conn.localPort,
      protocol: conn.protocol,
      state: conn.state
    }));

    // Deduplicate logic if multiple IPs listen on same port/pid could be added, but listing all interfaces is fine.
    
    res.json(result);
  } catch (error) {
    console.error('Error getting ports:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Kill a process by PID
 */
const killProcess = async (req, res) => {
  const { pid } = req.body;
  
  if (!pid) {
    return res.status(400).json({ error: 'PID is required' });
  }

  try {
    const success = await killPid(pid);
    if (success) {
      res.json({ success: true, message: `Process ${pid} terminated` });
    } else {
      res.status(500).json({ error: `Failed to kill process ${pid}` });
    }
  } catch (error) {
    console.error(`Error killing process ${pid}:`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPorts,
  killProcess
};
