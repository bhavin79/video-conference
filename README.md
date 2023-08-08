# video-conference
This is the first iteration of the webRTC-based video call Web App. WebRTC is a **low-latenc**y peer-to-peer communication technology used by web apps like **Zoom** and **Google Meet**.
To establish a WebRTC connection, a signaling server is a must. The purpose of the signaling server is to share information between users who want to start a video call.
I have created the signaling server using ExpressJS and SocketIO. It utilizes REST API for authentication, generation of meeting information, and a unique room. It uses WebSocket for sharing ICE Candidates as soon as both users join the room.
Authorization is established using Express sessions. This session is shared between WebSocket endpoints and REST API endpoints.
All the data is persisted onto MongoDB Atlas.
Lastly, the server uses CORS for both HTTP connections and WebSocket connections. Only the frontend can access the backend.

And now, the frontend – the most challenging part for a backend engineer like me!

It utilizes React. It uses Chakra UI for design, YUP and Formik for input validations,Axios for api calls and client-Socket.IO for WebSocket communication.
React handles the WebRTC connection between the clients. It also handles the streaming of video between the clients.

## To summarize:
The application follows a 3-tier architecture.
At the presentation layer, I have implemented ReactJS.
At the application layer, ExpressJS and Socket.IO are utilized.
At the data layer, it uses MongoDB.

## Future goals for version 1.2
- [x] here
- [] improve user experence using react
- [] improve webRTC error handling
- [] Implement redis for robust session handling
