// userConnectionsProxy.js
class UserConnectionsObserver {
    constructor() {
        this.connections = new Map();
        this.listeners = [];
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(action, userId) {
        for (const listener of this.listeners) {
            listener(action, userId);
        }
    }

    set(userId, ws) {
        if (!this.connections.has(userId)) {
            this.notifyListeners('add', userId);
        }
        this.connections.set(userId, ws);
    }

    delete(userId) {
        if (this.connections.has(userId)) {
            this.notifyListeners('remove', userId);
            this.connections.delete(userId);
        }
    }

    get(userId) {
        return this.connections.get(userId);
    }

    has(userId) {
        return this.connections.has(userId);
    }

    clear() {
        this.connections.clear();
        this.notifyListeners('clear');
    }

    getAll() {
        return this.connections;
    }
}

const userConnectionsObserver = new UserConnectionsObserver();
module.exports = { userConnectionsObserver };
