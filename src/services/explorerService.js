import { socketService } from './socketService';

class ExplorerService {
  constructor() {
    this.onResponse = null; // Callback for general responses
    this.onFileEvent = null; // Callback for real-time file events (created/deleted/modified)
    this.initialized = false;
  }

  connect(projectName, onConnect) {
    socketService.connect(() => {
      if (this.initialized) {
        if (onConnect) onConnect();
        return;
      }

      // Subscribe to explorer responses
      socketService.subscribe('/user/queue/explorer-response', (message) => {
        const data = JSON.parse(message.body);
        console.log('Explorer response:', data);
        if (data.status === 'error') {
            // Part 3: Create error handlers
            // throw a JSON string of FirestoreErrorInfo
            // Note: The spec says "Khi một thao tác... thất bại... bạn PHẢI throw một chuỗi JSON của FirestoreErrorInfo"
            // We can handle this by throwing or calling a global error handler.
            const errorInfo = {
                error: data.message || 'Unknown error',
                operationType: data.action || 'write',
                path: data.path || null,
                authInfo: {
                    userId: 'local-user', // Mocked as we don't have real auth info here
                    email: 'user@example.com',
                    emailVerified: true,
                    isAnonymous: false,
                    providerInfo: []
                }
            };
            throw new Error(JSON.stringify(errorInfo));
        }
        if (this.onResponse) {
          this.onResponse(data);
        }
      });

      // Subscribe to file events (real-time updates)
      socketService.subscribe('/user/queue/file-events', (message) => {
        const data = JSON.parse(message.body);
        console.log('File event:', data);
        if (this.onFileEvent) {
          this.onFileEvent(data);
        }
      });

      // Initial subscription to the watcher
      this.subscribeToWatcher(projectName);
      
      this.initialized = true;
      if (onConnect) onConnect();
    });
  }

  subscribeToWatcher(projectName) {
    socketService.publish('/app/explorer/subscribe', { projectName });
  }

  listProjectTree(path = '') {
    socketService.publish('/app/explorer/list', { path });
  }

  readFile(path) {
    socketService.publish('/app/explorer/read', { path });
  }

  createItem(path, isDirectory = false) {
    socketService.publish('/app/explorer/create', { path, directory: isDirectory });
  }

  deleteItem(path) {
    socketService.publish('/app/explorer/delete', { path });
  }

  copyItem(source, target) {
    socketService.publish('/app/explorer/copy', { source, target });
  }

  moveItem(source, target) {
    socketService.publish('/app/explorer/move', { source, target });
  }

  updateFile(path, operations) {
    // operations: Array of { index, type: 'removed' | 'added', value }
    socketService.publish('/app/explorer/update', { path, operations });
  }
}

export const explorerService = new ExplorerService();
