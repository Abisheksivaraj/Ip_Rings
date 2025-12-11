import { useEffect, useState, useCallback, useRef } from "react";

export function useBarcodeScanner() {
  const [barcodes, setBarcodes] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      console.log("Connection already in progress...");
      return;
    }

    // Determine WebSocket URL
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const wsUrl = isDevelopment
      ? "ws://localhost:2018" // Local development
      : "wss://ip-rings.onrender.com"; // Production Render URL

    console.log("Connecting to WebSocket:", wsUrl);
    console.log("Reconnect attempt:", reconnectAttemptsRef.current);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Set timeout for connection attempt
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log("Connection timeout");
          ws.close();
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("✓ WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data);

          if (data.type === "barcode" && data.barcode) {
            setBarcodes((prev) =>
              [
                {
                  barcode: data.barcode,
                  timestamp: data.timestamp,
                  id: Date.now() + Math.random(),
                },
                ...prev,
              ].slice(0, 100)
            );
          }
        } catch (err) {
          console.error("Parse error:", err);
        }
      };

      ws.onerror = (err) => {
        clearTimeout(connectionTimeout);
        console.error("WebSocket error:", err);
        setError("Connection error - Is the server running?");
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket disconnected", event.code, event.reason);
        setIsConnected(false);

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000
          );

          console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
          setError(
            `Reconnecting in ${delay / 1000}s... (Attempt ${
              reconnectAttemptsRef.current
            }/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (connectRef.current) {
              connectRef.current();
            }
          }, delay);
        } else {
          console.log("Max reconnection attempts reached");
          setError(
            "Failed to connect. Please refresh the page or check if the server is running."
          );
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError("Failed to connect: " + err.message);
    }
  }, []);

  // Update connectRef whenever connect changes
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Initial connection
  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Prevent reconnection on intentional close
        reconnectAttemptsRef.current = maxReconnectAttempts;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const clearBarcodes = useCallback(() => {
    setBarcodes([]);
  }, []);

  const manualReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setError(null);
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  return { barcodes, isConnected, error, clearBarcodes, manualReconnect };
}
