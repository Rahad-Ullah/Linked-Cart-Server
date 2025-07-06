export const sendLocation = async (recever:string,data:any) => {
    //@ts-ignore
    const io = global.io;
    io.emit(`getLocation::${recever}`, data);

};