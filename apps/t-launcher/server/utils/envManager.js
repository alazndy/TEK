const fs = require('fs').promises;
const path = require('path');

/**
 * Parse .env file content into key-value object
 * @param {string} content 
 * @returns {Object}
 */
function parseEnv(content) {
  const result = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    result[key] = value;
  }
  
  return result;
}

/**
 * Serialize object back to .env format
 * @param {Object} envObj 
 * @returns {string}
 */
function serializeEnv(envObj) {
  return Object.entries(envObj)
    .map(([key, value]) => {
      // Quote values with spaces
      if (value.includes(' ') || value.includes('#')) {
        return `${key}="${value}"`;
      }
      return `${key}=${value}`;
    })
    .join('\n');
}

/**
 * Read .env file from app directory
 * @param {string} appPath 
 * @returns {Promise<Object>}
 */
async function readEnvFile(appPath) {
  const envPath = path.join(appPath, '.env');
  const localPath = path.join(appPath, '.env.local');
  
  let content = '';
  let usedPath = null;
  
  // Try .env.local first, then .env
  try {
    content = await fs.readFile(localPath, 'utf-8');
    usedPath = localPath;
  } catch {
    try {
      content = await fs.readFile(envPath, 'utf-8');
      usedPath = envPath;
    } catch {
      // No env file exists
      return { exists: false, path: envPath, variables: {} };
    }
  }
  
  return {
    exists: true,
    path: usedPath,
    variables: parseEnv(content)
  };
}

/**
 * Write .env file to app directory
 * @param {string} appPath 
 * @param {Object} variables 
 * @param {boolean} useLocal - Write to .env.local instead
 * @returns {Promise<void>}
 */
async function writeEnvFile(appPath, variables, useLocal = false) {
  const envPath = path.join(appPath, useLocal ? '.env.local' : '.env');
  const content = serializeEnv(variables);
  await fs.writeFile(envPath, content, 'utf-8');
}

module.exports = {
  parseEnv,
  serializeEnv,
  readEnvFile,
  writeEnvFile
};
