// comments are generated from chatgpt for reveison purpose

import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secretKeyJWT = "asdasdsadasdasdasdsa"; // Secret key for JWT signing
const port = 3000; // Port where the server runs

const app = express(); // Create an Express app
const server = createServer(app); // Create an HTTP server

// Create a Socket.IO instance with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from the frontend
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies to be sent
  },
});

// Middleware to handle CORS for HTTP routes
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials like cookies
  })
);

// Route to return a simple "Hello World" message
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Route to login and send back a JWT as a cookie
app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "asdasjdhkasdasdas" }, secretKeyJWT); // Sign a token

  // Set the JWT token in a cookie
  res
    .cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" }) // Secure false for dev; sameSite as 'lax'
    .json({
      message: "Login Success",
    });
});

// Socket.IO middleware to authenticate WebSocket connections using JWT stored in cookies
io.use((socket, next) => {
  // Parse cookies from the socket request
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token; // Get the token from the cookies
    if (!token) return next(new Error("Authentication Error"));

    try {
      jwt.verify(token, secretKeyJWT); // Verify the JWT
      next(); // If verified, move to the next middleware
    } catch (error) {
      return next(new Error("Authentication Error"));
    }
  });
});

// Handle new WebSocket connections
io.on("connection", (socket) => {
  console.log("User Connected", socket.id); // Log the socket ID

  // Listen for 'message' events from the client
  socket.on("message", ({ room, message }) => {
    console.log({ room, message }); // Log the room and message
    socket.to(room).emit("receive-message", message); // Broadcast the message to users in the same room
  });

  // Listen for 'join-room' events and join the room
  socket.on("join-room", (room) => {
    socket.join(room); // Add the user to the specified room
    console.log(`User joined room ${room}`); // Log the room joining event
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id); // Log the disconnection
  });
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
