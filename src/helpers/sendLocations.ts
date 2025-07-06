import { Server } from "socket.io";

export const sendLocation = ({receiver,data}:{receiver:string,data:any}) => {
   
    const socketIo = (global as any).io as Server;
    if (socketIo) {
        socketIo.emit(`get-location::${receiver}`, data);
    }
}