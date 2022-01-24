import http from "http";
//import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname+"/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName)                       // socket.join()
        socket.to(roomName).emit("welcome");        // Peer A offer 생성후 연결구성 → Peer B에 offer 전송
    });

    socket.on("offer", (offer, roomName) => {       // Peer B에 offer 전송
        socket.to(roomName).emit("offer", offer)    // Peer B offer 받음
    });

    socket.on("answer", (answer, roomName) => {     // Peer A에 answer 전송
        socket.to(roomName).emit("answer", answer); // Peer A answer 받음
    })

    socket.on("ice", (ice, roomName) => {           // candidate 전송
        socket.to(roomName).emit("ice", ice)        // candidate 받음
    })
});
const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen); 