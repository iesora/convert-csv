import io from "socket.io-client";

// socket
export const socket = io("http://localhost:3003", {
  transports: ["websocket"],
  rejectUnauthorized: false,
});

export const useSocket = () => {
  return {
    joinRoom: () => {
      console.log("joinRoom");
      socket.emit("joinRoom", 1);
    },
    orderProduct: (m: { orderProductId: string }) => {
      socket.emit("orderProduct", m);
    },
  };
};
