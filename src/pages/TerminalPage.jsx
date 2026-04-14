import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import TerminalIDE from "../components/TerminalIDE";

const TerminalPage = () => {
  const [terminals, setTerminals] = useState([]);
  const terminalsRef = useRef([]);
  const stompClient = useRef(null);
  const subscriptions = useRef(new Map());

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      webSocketFactory: () => {
        return new WebSocket("ws://localhost:8080/ws");
      },
    });

    client.onConnect = () => {
      console.log("WebSocket connected");
      client.subscribe("/user/queue/terminal-created", (message) => {
        console.log("Received terminal-created message:", message.body);
        const { terminalId, workDir } = JSON.parse(message.body);
        const newRef = React.createRef();
        setTerminals((prev) => {
          const newTerminals = [
            ...prev,
            { id: terminalId, workDir, ref: newRef },
          ];
          terminalsRef.current = newTerminals;
          return newTerminals;
        });

        const sub = client.subscribe(
          `/user/queue/terminal${terminalId}`,
          (msg) => {
            const { output } = JSON.parse(msg.body);
            console.debug(`Received output for terminal ${terminalId}:`, { output }); // debug
            const term = terminalsRef.current.find((t) => t.id === terminalId);
            if (term) term.ref.current?.write(output);
          },
        );
        subscriptions.current.set(terminalId, sub);
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const handleData = (data, terminalId) => {
    console.debug("Sending command to backend:", { terminalId, command: data });
    stompClient.current?.publish({
      destination: "/app/terminal/exec",
      body: JSON.stringify({ terminalId, command: data }),
    });
  };

  const createNewTerminal = () => {
    console.log("Creating new terminal...");
    stompClient.current?.publish({
      destination: "/app/create-terminal",
      body: "{}",
    });
  };

  const closeTerminal = (terminalId) => {
    stompClient.current?.publish({
      destination: "/app/close-terminal",
      body: JSON.stringify({ terminalId }),
    });
    setTerminals((prev) => {
      const newTerminals = prev.filter((t) => t.id !== terminalId);
      terminalsRef.current = newTerminals;
      return newTerminals;
    });
    const sub = subscriptions.current.get(terminalId);
    if (sub) sub.unsubscribe();
    subscriptions.current.delete(terminalId);
  };

  return (
    <div className="p-6 bg-[#1e1e1e] min-h-screen text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Terminals</h2>
        <button 
          onClick={createNewTerminal}
          className="px-4 py-2 bg-[#007acc] hover:bg-[#005f9e] rounded font-medium transition-colors"
        >
          New Terminal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {terminals.map((terminal) => (
          <div key={terminal.id} className="border border-[#333333] rounded-lg overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-black/20">
              <h3 className="text-sm font-medium text-[#969696]">Terminal {terminal.id} - {terminal.workDir}</h3>
              <button 
                onClick={() => closeTerminal(terminal.id)}
                className="text-[#858585] hover:text-white transition-colors"
                title="Close Terminal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TerminalIDE
                ref={terminal.ref}
                onData={(data) => handleData(data, terminal.id)}
              />
            </div>
          </div>
        ))}
        {terminals.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-[#333333] rounded-lg text-[#858585]">
            <p>No active terminals. Click "New Terminal" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for X icon if not imported
const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default TerminalPage;
