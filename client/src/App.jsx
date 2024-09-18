// comments are generated from chatgpt for reveison purpose

import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const App = () => {
  // Establish WebSocket connection with the server
  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        withCredentials: true, // Ensure cookies (like JWT) are sent
      }),
    []
  );

  const [messages, setMessages] = useState([]); // Store messages received
  const [message, setMessage] = useState(""); // Input message
  const [room, setRoom] = useState(""); // Room to send messages to
  const [socketID, setSocketId] = useState(""); // Client's unique socket ID
  const [roomName, setRoomName] = useState(""); // Room to join

  // Handle message submission to the server
  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { message, room }); // Emit message to the specific room
    setMessage(""); // Clear the message input
  };

  // Handle room joining
  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName); // Emit room joining request
    setRoomName(""); // Clear the room input
  };

  // Use useEffect to handle socket events
  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id); // Set the client’s socket ID
      console.log("connected", socket.id);
    });

    // Listen for messages from the server
    socket.on("receive-message", (data) => {
      console.log(data);
      setMessages((messages) => [...messages, data]); // Append new message to messages array
    });

    // Example 'welcome' message from server
    socket.on("welcome", (s) => {
      console.log(s);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: 500 }} />
      <Typography variant="h6" component="div" gutterBottom>
        Socket ID: {socketID}
      </Typography>

      {/* Form to join a room */}
      <form onSubmit={joinRoomHandler}>
        <h5>Join Room</h5>
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Join Room
        </Button>
      </form>

      {/* Form to send messages */}
      <form onSubmit={handleSubmit}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="outlined-basic"
          label="Message"
          variant="outlined"
        />
        <TextField
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          id="outlined-basic"
          label="Room"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Send Message
        </Button>
      </form>

      {/* Display messages */}
      <Stack>
        {messages.map((m, i) => (
          <Typography key={i} variant="h6" component="div" gutterBottom>
            {m}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default App;
