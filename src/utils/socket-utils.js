import io from "socket.io-client";

class Socket {
  constructor() {
    if (!Socket.instance) {
      this.socket = io.connect("http://localhost:5000");
      Socket.instance = this;
    }

    return Socket.instance;
  }
}

const instance = new Socket();
Object.freeze(instance);

export default instance.socket;

// TODO: Make sure one socket is used once, may need global or session variable if all else fails
