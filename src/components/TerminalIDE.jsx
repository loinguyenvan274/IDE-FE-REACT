import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { 
  Plus, 
  X, 
  Terminal as TerminalIcon,
  Loader2
} from "lucide-react";
import { terminalService } from "../services/terminalService";

const TerminalIDE = forwardRef(({ className = "", onClose ,workDir}, ref) => {
  const termsRef = useRef({}); 
  const fitAddonsRef = useRef({});
  const sessionLogs = useRef({}); // History buffer for each session
  
  const [terminalSessions, setTerminalSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [connecting, setConnecting] = useState(true);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    write: (data, sessionId) => {
      const id = sessionId || activeSessionId;
      if (termsRef.current[id]) {
        termsRef.current[id].write(data);
      }
    }
  }));

  const createTerminalInstance = useCallback((id, container) => {
    if (termsRef.current[id]) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', monospace",
      theme: {
        background: "#1e1e1e",
        foreground: "#cccccc",
        cursor: "#aeafad",
        selectionBackground: "rgba(255, 255, 255, 0.1)",
      },
      allowTransparency: true,
      rows: 24,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(container);
    fitAddon.fit();

    termsRef.current[id] = term;
    fitAddonsRef.current[id] = fitAddon;

    term.onData(data => {
      terminalService.sendData(id, data);
    });

    // Restore logs if any reached us while terminal was initializing
    if (sessionLogs.current[id]) {
      term.write(sessionLogs.current[id]);
    }

    return term;
  }, []);

  useEffect(() => {
    // Setup terminal service callbacks
    terminalService.onTerminalCreated = (data) => {
      const { terminalId, workDir } = data;
      
      setTerminalSessions(prev => {
        if (prev.find(s => s.id === terminalId)) return prev;
        return [...prev, { id: terminalId, name: 'bash', workDir }];
      });
      setActiveSessionId(terminalId);
    };

    terminalService.onTerminalOutput = (terminalId, output) => {
      // Buffer output
      sessionLogs.current[terminalId] = (sessionLogs.current[terminalId] || "") + output;
      
      if (termsRef.current[terminalId]) {
        termsRef.current[terminalId].write(output);
      }
    };

    // Connect to WebSocket
    terminalService.connect(() => {
      setConnecting(false);
      // Create initial terminal if none exists
      if (terminalSessions.length === 0) {
        terminalService.createTerminal(workDir);
      }
    });

    return () => {
      // Cleanup all terminals on unmount
      Object.values(termsRef.current).forEach(t => t.dispose());
    };
  }, []);

  const handleAddNewSession = () => {
    terminalService.createTerminal(workDir);
  };

  const handleCloseSession = (e, id) => {
    e.stopPropagation();
    terminalService.closeTerminal(id);
    
    setTerminalSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (id === activeSessionId && filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveSessionId(null);
      }
      return filtered;
    });

    if (termsRef.current[id]) {
      termsRef.current[id].dispose();
      delete termsRef.current[id];
      delete fitAddonsRef.current[id];
      delete sessionLogs.current[id];
    }
  };

  // Resize logic
  const handleResize = useCallback(() => {
    if (activeSessionId && fitAddonsRef.current[activeSessionId]) {
      try {
        fitAddonsRef.current[activeSessionId].fit();
      } catch (e) {}
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (activeSessionId) {
      setTimeout(() => {
        handleResize();
        termsRef.current[activeSessionId]?.focus();
      }, 50);
    }
  }, [activeSessionId, handleResize]);

  // Window resize observer
  useEffect(() => {
    const handleWinResize = () => handleResize();
    window.addEventListener('resize', handleWinResize);
    return () => window.removeEventListener('resize', handleWinResize);
  }, [handleResize]);

  return (
    <div className={`flex flex-col h-full w-full bg-[#1e1e1e] text-[#cccccc] font-sans ${className}`}>
      {/* Header - Terminal Sessions Tabs */}
      <div className="flex items-center justify-between px-4 h-10 bg-[#1e1e1e] border-b border-black/10 select-none">
        <div className="flex items-center space-x-1 h-full overflow-x-auto no-scrollbar py-1">
          {connecting ? (
            <div className="flex items-center px-4 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin mr-2" />
              Connecting to backend...
            </div>
          ) : (
            <>
              {terminalSessions.map((session, index) => (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`flex items-center px-3 h-7 rounded-md cursor-pointer text-[11px] transition-all whitespace-nowrap group border ${
                    activeSessionId === session.id 
                      ? "bg-[#333333] text-white border-white/10 shadow-sm" 
                      : "text-[#858585] border-transparent hover:bg-[#2a2d2e] hover:text-[#cccccc]"
                  }`}
                >
                  <TerminalIcon size={12} className="mr-2 opacity-60" />
                  <span>{index}: {session.name}</span>
                  <X 
                    size={10} 
                    className="ml-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    onClick={(e) => handleCloseSession(e, session.id)}
                  />
                </div>
              ))}
              <button 
                onClick={handleAddNewSession}
                className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-white ml-2 shrink-0 transition-colors"
                title="New Terminal"
              >
                <Plus size={14} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-4 shrink-0">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content Area - Multiple Persistent Containers */}
      <div className="flex-1 relative overflow-hidden bg-[#1e1e1e] p-2">
        {terminalSessions.map((session) => (
          <div 
            key={session.id} 
            className={`h-full w-full ${activeSessionId === session.id ? 'block' : 'hidden'}`}
            ref={el => {
              if (el && !termsRef.current[session.id]) {
                createTerminalInstance(session.id, el);
              }
            }}
          />
        ))}
        {terminalSessions.length === 0 && !connecting && (
          <div className="h-full w-full flex items-center justify-center text-[#858585] text-xs italic">
            No active terminal sessions. Click '+' to start one.
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-[#2d2d2d] border-t border-black/10 text-[10px] text-[#858585] select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="opacity-50 uppercase">Session</span>
            <span className={activeSessionId ? "text-white/40 font-mono" : "text-red-500/40"}>
              {activeSessionId ? String(activeSessionId).slice(0, 8) : "NONE"}
            </span>
          </div>
          {activeSessionId && terminalSessions.find(s => s.id === activeSessionId)?.workDir && (
            <div className="flex items-center space-x-1">
              <span className="opacity-50 uppercase">Path</span>
              <span className="text-white/40 truncate max-w-[200px]">
                {terminalSessions.find(s => s.id === activeSessionId).workDir}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
});

export default TerminalIDE;


