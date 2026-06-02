import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(express.json());
app.use(cors());

// Track connected clients
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[${new Date().toLocaleTimeString()}] User connected: ${socket.id}`);
  connectedUsers.set(socket.id, { id: socket.id, username: 'Anonymous' });

  // User sets username
  socket.on('set-username', (username) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.username = username;
      console.log(`User ${socket.id} set username: ${username}`);
    }
  });

  // Handle notifications
  socket.on('send-notification', (data) => {
    const user = connectedUsers.get(socket.id);
    const username = user?.username || 'Anonymous';
    const message = data.message || 'New notification!';
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });

    console.log(`[${timestamp}] Notification from ${username}: ${message}`);

    // Broadcast to all connected clients
    io.emit('receive-notification', {
      user: username,
      message: message,
      timestamp: timestamp,
      senderId: socket.id,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    console.log(`[${new Date().toLocaleTimeString()}] User disconnected: ${socket.id} (${user?.username})`);
    connectedUsers.delete(socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString(),
  });
});

// REST endpoint for notifications (optional)
app.post('/api/notify', (req, res) => {
  const { user, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });

  // Broadcast via WebSocket
  io.emit('receive-notification', {
    user: user || 'System',
    message: message,
    timestamp: timestamp,
  });

  res.status(200).json({
    message: 'Notification sent',
    sentTo: connectedUsers.size,
    timestamp: timestamp,
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`CodeRunner backend running on port ${PORT}`);
  console.log(`WebSocket server ready at ws://localhost:${PORT}`);
});
