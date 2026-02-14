class WebSocket {
    constructor()
    {
        console.log("hello from Constuctor WebSocket")
    }
}
export class A {
  static socket: WebSocket = new WebSocket();
  constructor() {}
}
