import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { Session } from "next-auth";
import { PushNotif } from "../models/push/pushNotif";
import { LoginStatus, packageStatus } from "./loadingStatus";
var hubConnection: HubConnection | null = null;
let sessionVar: Session | null = null;
var objsVar: OnInstance[] = [];
var navbarNotifs: PushNotif[] = [];
let retryCount = 0;
let isRetrying = false;
const maxRetries = 5;

// Connection status state
let connectionStatusCallbacks: ((status: ConnectionStatus) => void)[] = [];

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | null;

export function subscribeToConnectionStatus(callback: (status: ConnectionStatus) => void) {
  connectionStatusCallbacks.push(callback);
  return () => {
    connectionStatusCallbacks = connectionStatusCallbacks.filter((cb) => cb !== callback);
  };
}

function notifyConnectionStatus(status: ConnectionStatus) {
  connectionStatusCallbacks.forEach((callback) => callback(status));
}

export default function startSignalR(session: Session | null) {
  // if (
  //   hubConnection?.state === HubConnectionState.Connected ||
  //   hubConnection?.state === HubConnectionState.Connecting
  // )
  //   return;
  // sessionVar = session;
  // let instagramerId = session?.user.instagramerIds[session?.user.currentIndex];
  // let userSession = {
  //   accessToken: session?.user.socketAccessToken,
  //   instagramerId: instagramerId,
  // };
  // let str = JSON.stringify(userSession);
  // var hubConnectionBuilder = new HubConnectionBuilder()
  //   .withUrl("https://socket.brancy.app/Hubs/PushClient?access_token=" + str)
  //   .build();
  // hubConnectionBuilder.start().catch((error) => {
  //   console.log(error);
  //   setTimeout(() => {
  //     startSignalR(sessionVar);
  //   }, 5000);
  //   hubConnectionBuilder.on("Instagramer", (data: string) => {
  //     console.log("Instagramer");
  //   });
  //   hubConnectionBuilder.on("User", (data: string) => {
  //     console.log("User");
  //   });
  // });
  // if (hubConnectionBuilder.state === HubConnectionState.Connected) {
  //   startSignalRMethod(objsVar);
  //   getHubConnection();
  // }
  // hubConnection = hubConnectionBuilder;
  if (
    hubConnection?.state === HubConnectionState.Connected ||
    hubConnection?.state === HubConnectionState.Connecting ||
    (session?.user.currentIndex !== -1 && !LoginStatus(session) && !packageStatus(session))
  )
    return;
  sessionVar = session;
  if (session == null) return;
  let instagramerId = session?.user.instagramerIds[session?.user.currentIndex];
  let userSession = { accessToken: session?.user.socketAccessToken };
  let instagramerSession = {
    accessToken: session?.user.socketAccessToken,
    instagramerId: instagramerId,
  };
  console.log("start signalr");
  let str = JSON.stringify(session.user.currentIndex === -1 ? userSession : instagramerSession);
  hubConnection = new HubConnectionBuilder()
    .withUrl("https://minisocket.brancy.app/Hubs/PushClient?access_token=" + str)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        return 5000;
      },
    })
    .build();
  console.log("build");

  // Add event listeners for automatic reconnection
  hubConnection.onclose((error) => {
    console.log("SignalR connection closed", error);
    if (retryCount < maxRetries && !isRetrying) {
      isRetrying = true;
      retryCount++;
      setTimeout(() => {
        console.log(`Attempting to reconnect SignalR... (Attempt ${retryCount}/${maxRetries})`);
        isRetrying = false;
        startSignalR(sessionVar);
      }, 5000);

      if (retryCount >= maxRetries) {
        notifyConnectionStatus("disconnected");
      }
    }
  });

  hubConnection.onreconnecting((error) => {
    console.log("SignalR reconnecting", error);
    notifyConnectionStatus("connecting");
  });

  hubConnection.onreconnected((connectionId) => {
    console.log("SignalR reconnected", connectionId);
    retryCount = 0;
    isRetrying = false;
    notifyConnectionStatus("connected");
  });

  hubConnection
    .start()
    .then(() => {
      console.log("SignalR Connected.");
      retryCount = 0;
      isRetrying = false;
      notifyConnectionStatus("connected");
    })
    .catch((error) => {
      console.log(error);
      retryCount++;
      if (retryCount >= maxRetries) {
        notifyConnectionStatus("disconnected");
      }
      if (!isRetrying) {
        isRetrying = true;
        setTimeout(() => {
          console.log(`Attempting to reconnect SignalR... (Attempt ${retryCount}/${maxRetries})`);
          isRetrying = false;
          startSignalR(sessionVar);
        }, 5000);
      }
    });
}
export function getHubConnection() {
  if (hubConnection?.state === HubConnectionState.Disconnected && !isRetrying) {
    console.log("sessionVar", sessionVar);
    startSignalR(sessionVar);
  } else if (hubConnection?.state === HubConnectionState.Connected) {
    return hubConnection;
  }
}
export function addSignalRMethod(objs: OnInstance[]) {
  objsVar = objsVar.concat(objs);
  if (hubConnection?.state === HubConnectionState.Disconnected) {
    startSignalR(sessionVar);
  } else {
    startSignalRMethod(objs);
  }
}
export function removeSignalRMethod(objs: OnInstance[]) {
  objsVar = objsVar.filter(
    (item1) => !objs.some((item2) => item2.callBack === item1.callBack && item2.functionName === item1.functionName)
  );
  stopSignalRMethod(objs);
}
function startSignalRMethod(objs: OnInstance[]) {
  for (let obj of objs) {
    hubConnection?.on(obj.functionName, obj.callBack);
  }
}
function stopSignalRMethod(objs: OnInstance[]) {
  for (let obj of objs) {
    hubConnection?.on(obj.functionName, obj.callBack);
  }
}
export interface OnInstance {
  callBack: (...args: any[]) => any;
  functionName: string;
}
export function addNavbarNotif(notif: PushNotif) {
  navbarNotifs.unshift(notif);
}
export function getNavbarNotif() {
  return navbarNotifs;
}
