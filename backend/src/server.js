// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 2018;

// CORS configuration - MUST be before middleware
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:3000",
  "https://your-frontend-url.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or scanner)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware - MUST be after CORS
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Store connected clients
let connectedClients = new Set();

// WebSocket connection handler with ping/pong for keep-alive
wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");
  connectedClients.add(ws);

  // Send initial connection message
  ws.send(
    JSON.stringify({
      type: "connection",
      message: "Connected to scanner server",
      timestamp: Date.now(),
    })
  );

  // Keep connection alive with ping every 30 seconds
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("pong", () => {
    console.log("Received pong from client");
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    clearInterval(pingInterval);
    connectedClients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(pingInterval);
    connectedClients.delete(ws);
  });
});

// Broadcast function
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  let successCount = 0;

  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        successCount++;
      } catch (error) {
        console.error("Error broadcasting to client:", error);
      }
    }
  });

  console.log(`Broadcasted to ${successCount} client(s)`);
}

// HTTP endpoint for scanner to send data
app.post("/scan", (req, res) => {
  let barcode;

  console.log("=== New Scan Request ===");
  console.log("Raw body:", req.body);
  console.log("Content-Type:", req.headers["content-type"]);

  // Handle different content types from scanner
  if (typeof req.body === "string") {
    // Plain text from scanner
    barcode = req.body.trim();
  } else if (req.body.barcode) {
    // JSON format: {"barcode": "123456"}
    barcode = req.body.barcode.trim();
  } else if (req.body.data) {
    // Alternative JSON format: {"data": "123456"}
    barcode = req.body.data.trim();
  } else if (Buffer.isBuffer(req.body)) {
    // Binary data
    barcode = req.body.toString().trim();
  } else {
    // Fallback - stringify the object
    barcode = JSON.stringify(req.body);
  }

  console.log("✓ Barcode received:", barcode);
  console.log("Connected clients:", connectedClients.size);

  // Broadcast to all connected WebSocket clients
  broadcastToClients({
    type: "barcode",
    barcode: barcode,
    timestamp: Date.now(),
  });

  // Send success response to scanner
  res.status(200).json({
    success: true,
    barcode: barcode,
    clients: connectedClients.size,
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    connectedClients: connectedClients.size,
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// Test endpoint to simulate scanner
app.post("/api/test-scan", (req, res) => {
  const testBarcode = req.body.barcode || "TEST" + Date.now();

  console.log("=== Test Scan ===");
  console.log("Test barcode:", testBarcode);

  broadcastToClients({
    type: "barcode",
    barcode: testBarcode,
    timestamp: Date.now(),
  });

  res.json({ success: true, barcode: testBarcode });
});

// Serve React static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // FIXED: Express 5.x compatible catch-all route
  // Use a more specific pattern instead of "*"
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log("═══════════════════════════════════════");
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ WebSocket server ready`);
  console.log("═══════════════════════════════════════");

  if (process.env.NODE_ENV === "production") {
    console.log(`Configure scanner to POST to:`);
    console.log(`https://YOUR_RENDER_URL/scan`);
  } else {
    console.log(`Configure scanner to POST to:`);
    console.log(`http://192.168.100.1:${PORT}/scan`);
    console.log(`or`);
    console.log(`http://localhost:${PORT}/scan`);
  }
  console.log("═══════════════════════════════════════");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");

  // Close all WebSocket connections
  connectedClients.forEach((client) => {
    client.close();
  });

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
