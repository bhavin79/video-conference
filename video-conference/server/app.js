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
import { getClient } from "./config/mongoConnection.js";
import "dotenv/config.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(urlencoded({}))
// const corsConfig = {
//     origin: "http://localhost:3000",
//     credentials:true,
// };
let httpServer = createServer(app);
let io = new Server(httpServer, {cors:corsConfig});

app.use(cors(corsConfig));

// const sessionMiddleware =session({
//     name: 'AuthCookie',
//     credentials:true, 
//     secret: "ThefamousSecretOfWebPrograming#$",
//     saveUninitialized: false,
//     resave: false,
//     cookie: { 
//         maxAge: 6000000,
//         sameSite: "lax"
//     }
// });
app.use(sessionMiddleware);

io.engine.use(sessionMiddleware);
io.use(authorizeUser);

configRoutes(app);
// io.on("connect", async(socket) =>{  
//     //get meet id for the user
//     const user = await getUser(socket.request.session.user.emailId);
    
//     //add this socket to the namespace
//     socket.join(user.meetId);

//     await websocketEvenets(socket, user.meetId);
//     // const req = socket.request;
//     // console.log(socket.request.session.user, socket.id);
//     socket.on("disconnect", ()=>{
//         socket.leave(user.meetId);
//     });

//     socket.on("reconnect", ()=>{
//         socket.join(user.meetId);
//     })
    
// });

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
let client

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

// httpServer.listen(8000, ()=>{
    
//     console.log("Server is listening on port 8000 localhost");
// })
