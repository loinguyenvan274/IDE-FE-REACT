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
  Trash2,
  X,
  ChevronDown,
  Terminal as TerminalIcon,
  AlertCircle,
  Info,
  Bug,
  Split,
  Maximize2,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TerminalIDE = forwardRef(({ className = "", onData }, ref) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [activeTab, setActiveTab] = useState("terminal");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const PROMPT = "\x1b[1;32m➜\x1b[0m \x1b[1;34m~\x1b[0m ";

  useImperativeHandle(ref, () => ({
    write: (data) => {
      if (termRef.current) {
        termRef.current.write(data);
      }
    },
    focus: () => {
      termRef.current?.focus();
    },
    clear: () => {
      termRef.current?.clear();
    },
  }));

  const executeCommand = (cmd) => {
    const term = termRef.current;
    if (!term) return;

    const trimmedCmd = cmd.trim();
    if (trimmedCmd === "") {
      term.write("\r\n" + PROMPT);
      return;
    }

    setHistory((prev) => [trimmedCmd, ...prev]);
    setHistoryIndex(-1);

    term.write("\r\n");

    const parts = trimmedCmd.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        term.write("Available commands:\r\n");
        term.write("  \x1b[1;36mhelp\x1b[0m    - Show this help message\r\n");
        term.write("  \x1b[1;36mclear\x1b[0m   - Clear the terminal\r\n");
        term.write("  \x1b[1;36mls\x1b[0m      - List files (simulated)\r\n");
        term.write("  \x1b[1;36mwhoami\x1b[0m  - Show current user\r\n");
        term.write("  \x1b[1;36mdate\x1b[0m    - Show current date\r\n");
        term.write("  \x1b[1;36mecho\x1b[0m    - Print text\r\n");
        term.write("  \x1b[1;36mexit\x1b[0m    - Close terminal session\r\n");
        break;
      case "clear":
        term.clear();
        break;
      case "ls":
        term.write(
          "src/  public/  package.json  tsconfig.json  vite.config.ts\r\n",
        );
        break;
      case "whoami":
        term.write("developer\r\n");
        break;
      case "date":
        term.write(new Date().toString() + "\r\n");
        break;
      case "echo":
        term.write(args.join(" ") + "\r\n");
        break;
      case "exit":
        term.write("Session ended. Type 'help' to restart.\r\n");
        break;
      default:
        term.write(`\x1b[31mCommand not found: ${command}\x1b[0m\r\n`);
    }

    term.write(PROMPT);
  };

  const handleResize = useCallback(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: "#1e1e1e",
        foreground: "#cccccc",
        cursor: "#aeafad",
        selectionBackground: "#264f78",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#e5e5e5",
      },
      allowTransparency: true,
      cursorStyle: "block",
      rows: 20,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    if (!onData) {
      term.write("\x1b[1;34mWelcome to the VS Code Terminal IDE\x1b[0m\r\n");
      term.write(
        "Type \x1b[1;32m'help'\x1b[0m to see available commands.\r\n\r\n",
      );
      term.write(PROMPT);
    }

    let inputBuffer = "";

    term.onData((data) => {
      if (onData) {
        onData(data);
        return;
      }

      const code = data.charCodeAt(0);

      if (code === 13) {
        // Enter
        executeCommand(inputBuffer);
        inputBuffer = "";
      } else if (code === 127) {
        // Backspace
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          term.write("\b \b");
        }
      } else if (code === 27) {
        // Escape sequences (arrows)
        // Basic arrow handling could be added here
      } else if (code < 32) {
        // Control characters
      } else {
        inputBuffer += data;
        term.write(data);
      }
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, [handleResize, onData]);

  const tabs = [
    { id: "problems", label: "Problems", icon: AlertCircle, count: 0 },
    { id: "output", label: "Output", icon: Info },
    { id: "debug", label: "Debug Console", icon: Bug },
    { id: "terminal", label: "Terminal", icon: TerminalIcon },
  ];

  return (
    <div
      className={`flex flex-col h-full w-full bg-[#1e1e1e] text-[#cccccc] font-sans border-t border-[#333333] ${className}`}
    >
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-4 h-9 bg-[#1e1e1e] border-b border-[#333333] select-none">
        <div className="flex items-center space-x-6 h-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 h-full text-xs font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-[#858585] hover:text-[#cccccc]"
              }`}
            >
              <span>{tab.label.toUpperCase()}</span>
              {tab.count !== undefined && (
                <span className="flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] bg-[#333333] rounded-full text-white">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#252526] rounded px-2 py-0.5 border border-[#3c3c3c] cursor-pointer hover:bg-[#2a2d2e]">
            <span className="text-[11px] mr-2">1: node</span>
            <ChevronDown size={12} />
          </div>
          <div className="h-4 w-[1px] bg-[#3c3c3c] mx-1" />
          <button
            className="p-1 hover:bg-[#37373d] rounded transition-colors"
            title="New Terminal"
          >
            <Plus size={16} />
          </button>
          <button
            className="p-1 hover:bg-[#37373d] rounded transition-colors"
            title="Split Terminal"
          >
            <Split size={14} />
          </button>
          <button
            className="p-1 hover:bg-[#37373d] rounded transition-colors"
            title="Clear Terminal"
            onClick={() => termRef.current?.clear()}
          >
            <Trash2 size={14} />
          </button>
          <button
            className="p-1 hover:bg-[#37373d] rounded transition-colors"
            title="Maximize Panel"
          >
            <Maximize2 size={14} />
          </button>
          <button
            className="p-1 hover:bg-[#37373d] rounded transition-colors"
            title="Close Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 relative overflow-hidden p-2">
        <AnimatePresence mode="wait">
          {activeTab === "terminal" ? (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
              ref={terminalRef}
            />
          ) : (
            <motion.div
              key="other"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full w-full flex flex-col items-center justify-center text-[#858585] space-y-2"
            >
              <div className="p-4 rounded-full bg-[#252526]">
                {(() => {
                  const tab = tabs.find((t) => t.id === activeTab);
                  return tab && tab.icon
                    ? React.createElement(tab.icon, { size: 32 })
                    : null;
                })()}
              </div>
              <p className="text-sm">No {activeTab} output to display.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-[#007acc] text-white text-[11px] select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 hover:bg-[#1f8ad2] px-1 cursor-pointer">
            <Split size={12} className="rotate-90" />
            <span>main*</span>
          </div>
          <div className="flex items-center space-x-1 hover:bg-[#1f8ad2] px-1 cursor-pointer">
            <AlertCircle size={12} />
            <span>0</span>
            <Bug size={12} />
            <span>0</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hover:bg-[#1f8ad2] px-1 cursor-pointer">
            Ln 1, Col 1
          </div>
          <div className="hover:bg-[#1f8ad2] px-1 cursor-pointer">
            Spaces: 2
          </div>
          <div className="hover:bg-[#1f8ad2] px-1 cursor-pointer">UTF-8</div>
          <div className="hover:bg-[#1f8ad2] px-1 cursor-pointer">
            JavaScript JSX
          </div>
          <div className="hover:bg-[#1f8ad2] px-1 cursor-pointer">
            <MoreHorizontal size={14} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default TerminalIDE;
