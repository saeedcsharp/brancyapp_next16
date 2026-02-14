const uri = "ws://" + "localhost:5005" + "/ws";
class SocketClass {
  newWS: WebSocket = new WebSocket(uri);
  constructor(session: string, instagramId: string) {
    this.newWS = new WebSocket(uri);
    console.log("hellow from socket")
    this.newWS.send(
      JSON.stringify({ session: session, instagramId: instagramId })
    );
  }
}
