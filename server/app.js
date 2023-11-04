import express, { urlencoded } from "express";
import configRoutes from "./routes/index.js";
import cors from "cors";
import session from "express-session";
import { Server } from "socket.io";
import { createServer } from "http";
import authorizeUser from "./websocket/socketController.js";
import websocketEvenets from "./websocket/events.js";
import sessionMiddleware from "./middleware/sessionMiddleware.js";
import { corsConfig } from "./config/settings.js";
import { getUser } from "./data/users.js";
import { connectDB } from "./config/mongoConnection.js";
// import { getClient } from "./config/mongoConnection.js";
import "dotenv/config.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let httpServer = createServer(app);
let io = new Server(httpServer, {cors:corsConfig});

app.use(cors(corsConfig));

app.use(sessionMiddleware);

io.engine.use(sessionMiddleware);
io.use(authorizeUser);

configRoutes(app);

io.on("connect", (socket) =>{  
    const req = socket.request;

    //get meet id for the user
    socket.use((__, next) => {
        req.session.reload((err) => {
          if (err) {
            socket.disconnect();
          } else {
            next();
          }
        });
        req.session.save();
      });
    const user =  socket.request.session.user;
    const room = user.meetId;
    socket.join(room);
    socket.on("waiting:joined", (data)=>{
        socket.to(room).emit("participant:joined", {emailId: user.emailId});
    });

    socket.on("call", ({offer})=>{
        // console.log(to);
        // console.log(offer);
        socket.to(room).emit('receive', {emailId:user.emailId, offer});
    });

    socket.on("callAccepted", ({ans})=>{
        console.log(`call accepted ${socket.id} ${ans}`);
        socket.to(room).emit('callAccepted', {ans});
    }); 

    socket.on("peer:nego:needed", ({offer})=>{
      console.log("peer:nego:needed", socket.id)
        socket.to(room).emit('peer:nego:needed', {offer});
    });

    socket.on("peer:nego:done", ({ans})=>{
        socket.to(room).emit("peer:nego:final", {ans});
    })

    socket.on("disconnect", ()=>{
        // socket.leave(user.meetId);
    });

    socket.on("reconnect", ()=>{
        // socket.join(user.meetId);
    })
    
});
// httpServer.listen(8000, ()=>{
//   console.log("Server is listening on port 8000 localhost");
// })


// let client
 
const start = async () => {
    try {
      await connectDB(process.env.MONGO_URI);

      httpServer.listen(8000, ()=>{ 
        console.log("Server is listening on port 8000 localhost");
    });
    } catch (error) {
      console.log(error);
    }
  };

start();
