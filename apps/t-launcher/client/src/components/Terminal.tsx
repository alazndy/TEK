import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Copy, Trash2, Check, ArrowDownToLine, Search } from 'lucide-react';

interface TerminalProps {
  appId: string;
  socket: any;
  isActive: boolean;
}

// ANSI color code to Tailwind class mapping
const ansiToColor: Record<string, string> = {
  // Standard colors
  '30': 'text-slate-900',      // Black
  '31': 'text-red-500',        // Red
  '32': 'text-emerald-500',    // Green
  '33': 'text-yellow-500',     // Yellow
  '34': 'text-blue-500',       // Blue
  '35': 'text-purple-500',     // Magenta
  '36': 'text-cyan-500',       // Cyan
  '37': 'text-slate-200',      // White
  // Bright colors
  '90': 'text-slate-500',      // Bright Black (Gray)
  '91': 'text-red-400',        // Bright Red
  '92': 'text-emerald-400',    // Bright Green
  '93': 'text-yellow-400',     // Bright Yellow
  '94': 'text-blue-400',       // Bright Blue
  '95': 'text-purple-400',     // Bright Magenta
  '96': 'text-cyan-400',       // Bright Cyan
  '97': 'text-white',          // Bright White
};

const ansiToBg: Record<string, string> = {
  '40': 'bg-slate-900',
  '41': 'bg-red-600',
  '42': 'bg-emerald-600',
  '43': 'bg-yellow-600',
  '44': 'bg-blue-600',
  '45': 'bg-purple-600',
  '46': 'bg-cyan-600',
  '47': 'bg-slate-200',
};

// Parse ANSI codes and convert to styled spans
const parseAnsi = (text: string): React.ReactNode[] => {
  // Remove cursor control and other non-color escape sequences
  const cleanedText = text
    .replace(/\x1b\[\?[0-9;]*[a-zA-Z]/g, '')  // Cursor visibility, etc
    .replace(/\x1b\[[0-9]*[JKH]/g, '')         // Clear screen, cursor position
    .replace(/\x1b\][^\x07]*\x07/g, '')        // OSC sequences (title)
    .replace(/\x1b\[[0-9]*[ABCD]/g, '')        // Cursor movement
    .replace(/\r/g, '');                        // Carriage returns

  // Split by ANSI color codes
  const parts = cleanedText.split(/(\x1b\[[0-9;]*m)/);
  const result: React.ReactNode[] = [];
  let currentColor = 'text-slate-300';
  let currentBg = '';
  let isBold = false;

  parts.forEach((part, index) => {
    if (part.startsWith('\x1b[')) {
      // Parse the ANSI code
      const codes = part.slice(2, -1).split(';');
      codes.forEach(code => {
        if (code === '0' || code === 'm' || code === '') {
          // Reset
          currentColor = 'text-slate-300';
          currentBg = '';
          isBold = false;
        } else if (code === '1') {
          isBold = true;
        } else if (ansiToColor[code]) {
          currentColor = ansiToColor[code];
        } else if (ansiToBg[code]) {
          currentBg = ansiToBg[code];
        }
      });
    } else if (part) {
      // Regular text - apply current styles
      const className = `${currentColor} ${currentBg} ${isBold ? 'font-bold' : ''}`.trim();
      result.push(
        <span key={index} className={className}>
          {part}
        </span>
      );
    }
  });

  return result;
};

// Clean ANSI codes completely (for copy/search)
const stripAnsi = (text: string): string => {
  return text
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1b\][^\x07]*\x07/g, '')
    .replace(/\r/g, '');
};

export const Terminal: React.FC<TerminalProps> = ({ appId, socket, isActive }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleOutput = ({ appId: id, data }: { appId: string, data: string }) => {
      if (id === appId) {
        setLogs(prev => {
          const newLogs = [...prev, data];
          if (newLogs.length > 500) {
            return newLogs.slice(-500);
          }
          return newLogs;
        });
      }
    };

    socket.on('output', handleOutput);
    return () => {
      socket.off('output', handleOutput);
    };
  }, [appId, socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      socket.emit('input', { appId, data: inputValue + '\n' });
      setInputValue('');
    }
  };

  // Focus input when active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  // Filtered logs based on search
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    return logs.filter(log => 
      stripAnsi(log).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  // Copy all logs to clipboard (cleaned)
  const handleCopyAll = async () => {
    const allLogs = logs.map(stripAnsi).join('\n');
    try {
      await navigator.clipboard.writeText(allLogs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy logs:', err);
    }
  };

  // Clear logs
  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0f] rounded-lg overflow-hidden">
      {/* Terminal Header with Actions */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            Terminal
          </span>
          <span className="text-[10px] text-slate-600">
            {logs.length} lines
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded transition-colors ${
              showSearch 
                ? 'text-blue-400 bg-blue-500/10' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title="Search logs"
          >
            <Search size={14} />
          </button>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded transition-colors ${
              autoScroll 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          >
            <ArrowDownToLine size={14} />
          </button>
          
          {/* Clear logs */}
          <button
            onClick={handleClear}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
            title="Clear logs"
          >
            <Trash2 size={14} />
          </button>
          
          {/* Copy all */}
          <button
            onClick={handleCopyAll}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
              copied 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title="Copy all logs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="text-[10px]">{copied ? 'Copied!' : 'Copy All'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-3 py-2 bg-slate-900/30 border-b border-slate-800">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-slate-800/50 text-slate-300 text-xs font-mono px-2 py-1.5 rounded border border-slate-700 outline-none focus:border-blue-500 placeholder-slate-500"
          />
          {searchTerm && (
            <span className="text-[10px] text-slate-500 mt-1 block">
              {filteredLogs.length} / {logs.length} matches
            </span>
          )}
        </div>
      )}

      {/* Log Output */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic">
            {searchTerm ? 'No matches found...' : 'Waiting for output...'}
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={i} className="hover:bg-slate-900/50 -mx-1 px-1 rounded">
              {parseAnsi(log)}
            </div>
          ))
        )}
      </div>
      
      {/* Input */}
      <div className="border-t border-slate-800 p-2 flex items-center gap-2">
        <span className="text-emerald-400 font-mono text-xs">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command and press Enter..."
          className="flex-1 bg-transparent text-slate-300 text-xs font-mono outline-none placeholder-slate-600"
          title="Command input"
        />
      </div>
    </div>
  );
};
