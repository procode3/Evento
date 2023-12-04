// postgresMiddleware.js

import { Server as SocketIoServer } from "socket.io";
import { pgClient } from "../utils/dbClient";
import createSubscriber from "pg-listen";
import "dotenv/config";


const pgNotify = (io) => {
  
  // Connect to PostgreSQL
  pgClient.connect().then(() => {
    console.log("Connected to Postgres");
    const subscriber = createSubscriber({ connectionString: process.env.DATABASE_URL+`?ssl=true` })

    io.on('connection', (socket) => {
        console.log(`${"No one"} has connected`);

        //check logged in user on socket.request.user
        console.log(socket?.passport);

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('userId', (userId) => {
            console.log('user id is', userId);
        });
    });
  
  subscriber.notifications.on("new_event", (payload) => {
    console.log("Row added!", payload);
    io.emit("new_event", payload); // Emit the payload to connected clients
  });

  subscriber.events.on("error", (error) => {
    console.error("Fatal database connection error:", error);
    process.exit(1);
  });

  subscriber.notifications.on("error", (error) => {
    console.error("Fatal database notification error:", error);
    process.exit(1);
  });

  // Start PostgreSQL listener
  (async () => {
    await subscriber.connect();
    await subscriber.listenTo("new_event");
  })().catch(console.error);

}).catch((err) => {
  console.error(err);
});

  return (req, res, next) => {
    req.io = io; // Make io accessible in routes
    
    next();
  };
};



export {pgNotify};
