const { exec } = require('child_process');
const path = require('path');

/**
 * Get current git branch
 * @param {string} repoPath 
 * @returns {Promise<string>}
 */
function getCurrentBranch(repoPath) {
  return new Promise((resolve, reject) => {
    exec('git branch --show-current', { cwd: repoPath }, (err, stdout) => {
      if (err) {
        resolve(null); // Not a git repo
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Get git status (modified files count)
 * @param {string} repoPath 
 * @returns {Promise<Object>}
 */
function getGitStatus(repoPath) {
  return new Promise((resolve, reject) => {
    exec('git status --porcelain', { cwd: repoPath }, (err, stdout) => {
      if (err) {
        resolve({ isGitRepo: false });
        return;
      }
      
      const lines = stdout.trim().split('\n').filter(l => l);
      const modified = lines.filter(l => l.startsWith(' M') || l.startsWith('M ')).length;
      const untracked = lines.filter(l => l.startsWith('??')).length;
      const staged = lines.filter(l => l.startsWith('A ') || l.startsWith('M ')).length;
      
      resolve({
        isGitRepo: true,
        modified,
        untracked,
        staged,
        hasChanges: lines.length > 0
      });
    });
  });
}

/**
 * Get last commit info
 * @param {string} repoPath 
 * @returns {Promise<Object>}
 */
function getLastCommit(repoPath) {
  return new Promise((resolve, reject) => {
    exec('git log -1 --format="%h|%s|%ar"', { cwd: repoPath }, (err, stdout) => {
      if (err) {
        resolve(null);
        return;
      }
      
      const [hash, message, time] = stdout.trim().split('|');
      resolve({ hash, message, time });
    });
  });
}

/**
 * Check if remote has updates
 * @param {string} repoPath 
 * @returns {Promise<boolean>}
 */
function hasRemoteUpdates(repoPath) {
  return new Promise((resolve) => {
    exec('git fetch --dry-run 2>&1', { cwd: repoPath }, (err, stdout, stderr) => {
      // If there's any output, there are updates
      resolve((stdout + stderr).trim().length > 0);
    });
  });
}

/**
 * Pull latest changes
 * @param {string} repoPath 
 * @returns {Promise<Object>}
 */
function gitPull(repoPath) {
  return new Promise((resolve) => {
    exec('git pull --rebase', { cwd: repoPath }, (err, stdout, stderr) => {
      if (err) {
        resolve({ success: false, message: stderr || err.message });
        return;
      }
      resolve({ success: true, message: stdout.trim() });
    });
  });
}

/**
 * Get full git info for an app
 * @param {string} repoPath 
 * @returns {Promise<Object>}
 */
async function getGitInfo(repoPath) {
  const [branch, status, lastCommit] = await Promise.all([
    getCurrentBranch(repoPath),
    getGitStatus(repoPath),
    getLastCommit(repoPath)
  ]);
  
  return {
    branch,
    ...status,
    lastCommit
  };
}

module.exports = {
  getCurrentBranch,
  getGitStatus,
  getLastCommit,
  hasRemoteUpdates,
  gitPull,
  getGitInfo
};
