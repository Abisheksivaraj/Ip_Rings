import React from "react";
import { useBarcodeScanner } from "./Hooks/useBarcodeScanner";
import StatusBar from "./Components/StatusBar";
import BarcodeList from "./Components/BarcodeList";
import TestButton from "./Components/TestButton";
import "./App.css";

function App() {
  const { barcodes, isConnected, error, clearBarcodes } = useBarcodeScanner();

  return (
    <div className="App">
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>📦 Barcode Scanner System</h1>
          <p style={styles.subtitle}>
            Real-time barcode scanning with Datalogic Matrix M220
          </p>
        </header>

        <StatusBar isConnected={isConnected} error={error} />

        <TestButton />

        <BarcodeList barcodes={barcodes} onClear={clearBarcodes} />

        <footer style={styles.footer}>
          <p>
            Configure your scanner to POST to:{" "}
            <code>{window.location.origin}/scan</code>
          </p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    color: "#333",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    fontSize: "16px",
  },
  footer: {
    marginTop: "40px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default App;
