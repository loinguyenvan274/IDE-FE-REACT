import { Client } from '@stomp/stompjs';
import { authService } from './authService';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connectCallbacks = [];
  }

  connect(onConnect) {
    if (this.client && this.connected) {
      if (onConnect) onConnect(this.client);
      return;
    }

    if (onConnect) {
      this.connectCallbacks.push(onConnect);
    }

    // Prevents multiple connection attempts
    if (this.client && !this.connected) return;

    const token = authService.getToken();

    this.client = new Client({
      brokerURL: SOCKET_URL,
      reconnectDelay: 10000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    this.client.onConnect = (frame) => {
      console.log('STOMP WebSocket connected', frame);
      this.connected = true;
      
      this.connectCallbacks.forEach(cb => cb(this.client));
      this.connectCallbacks = [];
    };

    this.client.onDisconnect = () => {
      console.log('STOMP WebSocket disconnected');
      this.connected = false;
    };

    this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error('STOMP Error details:', frame.body);
    };

    this.client.activate();
  }

  subscribe(destination, callback) {
    if (this.client && this.connected) {
      return this.client.subscribe(destination, callback);
    } else {
      console.warn(`Cannot subscribe to ${destination}, not connected`);
      return null;
    }
  }

  publish(destination, body = {}) {
    if (this.client && this.connected) {
      this.client.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
    } else {
      console.warn(`Cannot publish to ${destination}, not connected`);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.client = null;
      this.connectCallbacks = [];
    }
  }
}

export const socketService = new SocketService();
