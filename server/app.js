import express, { urlencoded } from "express";
import configRoutes from "./routes/index.js";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import authorizeUser from "./websocket/socketController.js";
import sessionMiddleware from "./middleware/sessionMiddleware.js";
import { corsConfig } from "./config/settings.js";
import { connectDB } from "./config/mongoConnection.js";
import "dotenv/config.js";
import { getRedisClient } from "./config/redisConnect.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let httpServer = createServer(app);
let io = new Server(httpServer, { cors: corsConfig });

app.use(cors(corsConfig));

app.use(sessionMiddleware);

io.engine.use(sessionMiddleware);
io.use(authorizeUser);

app.use((req, res, next) => {
  req.io = io;
  return next();
});

configRoutes(app);

//*********** call based CODE *************************

let client = await getRedisClient();
io.on("connect", (socket) => {
  const req = socket.request;
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
  const user = socket.request.session.user; //join room with your email;
  const emailId = user.emailId;
  socket.join(emailId);

  socket.on("call-initiated-join-room", async () => {
    const meetId = await client.get(user.emailId);
    if (meetId) {
      socket.join(meetId);
      console.log(socket.id, meetId, user.emailId);
    }
  });

  socket.on("offer", async ({ data }) => {
    //from user@test.com
    const { offer } = data;
    const meetId = await client.get(user.emailId);
    if (meetId) {
      console.log("--------------------------------------------");
      console.log(meetId, "offer", user.emailId);
      console.log(offer);
      console.log("--------------------------------------------");
      socket.join(meetId);
      socket.to(meetId).emit("offer:receive", { msg: offer });
    }
  });

  socket.on("answer", async (data) => {
    //from user@ex.com
    // console.log(data);
    const meetId = await client.get(user.emailId);
    if (meetId) {
      console.log("--------------------------------------------");
      console.log(meetId, "answer", user.emailId);
      console.log(data.answer);
      console.log("--------------------------------------------");

      socket.join(meetId);
      socket.to(meetId).emit("answer:received", { msg: data.answer });
    }
  });

  socket.on("icecandidate", async (data) => {
    const meetId = await client.get(user.emailId);
    if (meetId) {
      console.log("--------------------------------------------");
      console.log(meetId, "icecndiate", user.emailId);
      console.log("--------------------------------------------");

      socket.join(meetId);
      const { candiates } = data;
      socket.to(meetId).emit("icecandidate:receive", { msg: candiates });
    }
  });

  socket.on("callEnd", async (data) => {
    const meetId = await client.get(user.emailId);
    socket.to(meetId).emit("callEnd:receive", { msg: "call end" });
  });

  socket.on("disconnect", async () => {
    // const meetId = await client.get(user.emailId);
    // if (meetId) {
    //   socket.leave(meetId);
    // }
  });

  socket.on("reconnect", async () => {
    const meetId = await client.get(user.emailId);
    if (meetId) {
      socket.join(meetId);
    }
  });
});
httpServer.listen(8000, () => {
  console.log("Server is listening on port 8000 localhost");
});

// ************** For MongoDB atlas **********
// let client

// const start = async () => {
//     try {
//       await connectDB(process.env.MONGO_URI);

//       httpServer.listen(8000, ()=>{
//         console.log("Server is listening on port 8000 localhost");
//     });
//     } catch (error) {
//       console.log(error);
//     }
//   };

// start();
