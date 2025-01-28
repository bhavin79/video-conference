# Connect me (Renamed from Video Conference)
This is the second iteration of the WebRTC-based video call web app. WebRTC is a low-latency open-source communication protocol used by web apps like Zoom and Google Meet.

WebRTC stands out because it creates a decentralized communication channel. Even though the protocol itself is decentralized, the initial process to set up the connection between peers is centralized through a signaling server. Since video calling is a real-time process, the signaling server needs to use WebSocket to streamline the entire process.

I have designed and developed the signaling server using Node.js. The signaling server hosts two separate servers, one for the REST API and the other for WebSocket communication. The REST API is used for authentication and generation of unique call IDs, while WebSocket is used for bidirectional sharing of protocol-related unique information as soon as the call is accepted. At the same time, session information is persisted in Redis, and data is persisted in MongoDB.

The frontend uses React, Tailwind CSS, and react-hook-form.


## Installation

1. Clone the repository.
2. Navigate to client directory and run npm install to install dependencies.
3. Navigate to server directory and run npm install to install dependencies.
4. Set up MongoDB and Redis servers (with default ports.)
5. Run npm start in server directory and npm run dev in client directory. 



## To summarize:
The application follows a 3-tier architecture.
At the presentation layer, I have implemented ReactJS.
At the application layer, ExpressJS and Socket.IO are utilized.
At the data layer, it uses MongoDB.


