import { socketService } from './socketService';
import { authService } from './authService';

class TerminalService {
  constructor() {
    this.onTerminalCreated = null;
    this.onTerminalOutput = null;
    this.subscriptions = new Map();
  }

  connect(onConnect) {
    socketService.connect((client) => {
      // Global subscription for terminal creation
      socketService.subscribe('/user/queue/terminal-created', (message) => {
        const data = JSON.parse(message.body);
        console.log('Terminal created event:', data);
        if (this.onTerminalCreated) {
          this.onTerminalCreated(data);
        }

        // Auto subscribe to the new terminal output
        this.subscribeToTerminal(data.terminalId);
      });

      if (onConnect) onConnect();
    });
  }

  subscribeToTerminal(terminalId) {
    if (this.subscriptions.has(terminalId)) return;

    const sub = socketService.subscribe(`/user/queue/terminal${terminalId}`, (message) => {
      const { output } = JSON.parse(message.body);
      if (this.onTerminalOutput) {
        this.onTerminalOutput(terminalId, output);
      }
    });

    if (sub) {
      this.subscriptions.set(terminalId, sub);
    }
  }

  unsubscribeFromTerminal(terminalId) {
    const sub = this.subscriptions.get(terminalId);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(terminalId);
    }
  }

  createTerminal(workDir) {
    socketService.publish('/app/create-terminal', {workDir});
  }

  sendData(terminalId, data) {
    socketService.publish('/app/terminal/exec', { terminalId, command: data });
  }

  closeTerminal(terminalId) {
    socketService.publish('/app/close-terminal', { terminalId });
    this.unsubscribeFromTerminal(terminalId);
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
  }
}

export const terminalService = new TerminalService();
