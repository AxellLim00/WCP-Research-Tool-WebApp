import io from "socket.io-client";

class Socket {
  constructor() {
    if (!Socket.instance) {
      this.socket = io({});
      Socket.instance = this;
    }

    return Socket.instance;
  }
}

var instance = new Socket();
Object.freeze(instance);

export default instance.socket;
