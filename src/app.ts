import express from "express";
import { readdirSync } from "fs";
import { sayHelloController } from "./controllers/index";
import "dotenv/config";
import { errorHandler } from "./middlewares/index";
import session, { Session } from "express-session";
import passport from "./utils/passport";
import cors from "cors";
import morgan from "morgan";
import { authenticateJWT, pgNotify } from "./middlewares";
import https from "https";
import cron from "node-cron";
import { createServer } from "http";
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./swagger");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"]
    }
});


app.use(morgan("dev"));

//  Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOptions));

function keepAlive(url) {
  https
    .get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
    })
    .on("error", (error) => {
      console.error(`Error: ${error.message}`);
    });
}

// cron job to ping the server every minute
cron.schedule("*/5 * * * *", () => {
  keepAlive("https://evento-qo6d.onrender.com/");
  console.log("pinging the server every minute");
});

// middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

io.engine.use(session({
  secret: process.env.JWT_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
}));
app.use(pgNotify(io));

// app.use(authToken);

//serve all routes dynamically using readdirsync
readdirSync("./src/routes").map((path) => {
  if (!path.includes("auth")) {
    app.use("/api/v1/", authenticateJWT, require(`./routes/${path}`));
    // app.use("/api/v1/", require(`./routes/${path}`));
  } else {
    app.use("/api/v1/", require(`./routes/${path}`));
  }
});
app.get("/", sayHelloController);
app.use(errorHandler);
const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

