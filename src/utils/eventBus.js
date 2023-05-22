class Event {
    constructor() {
        this.callbacks = [];
    }

    subscribe(callback) {
        this.callbacks.push(callback);
    }

    publish(data) {
        this.callbacks.forEach(callback => callback(data));
    }
}

class EventBus {
    constructor() {
        return new Proxy(this, {
        get: (target, property) => {
            if (!target[property]) {
            target[property] = new Event();
            }
            
            return target[property];
        }
        });
    }
}
  
const eventBus = new EventBus();
export default eventBus;