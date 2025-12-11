import React, { useState } from "react";

function TestButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTest = async () => {
    setLoading(true);
    setMessage("");

    try {
      const testBarcode = "TEST" + Date.now();

      // Use Render URL for API calls
      const apiUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:2018"
          : "https://ip-rings.onrender.com";

      const response = await fetch(`${apiUrl}/api/test-scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode: testBarcode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Test scan result:", data);
      setMessage("✓ Test successful! Check the barcode list below.");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Test failed:", error);
      setMessage("✗ Test failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleTest} disabled={loading} style={styles.button}>
        {loading ? "Testing..." : "🧪 Test Scanner"}
      </button>
      {message && (
        <div
          style={{
            ...styles.message,
            color: message.includes("✓") ? "#155724" : "#721c24",
            backgroundColor: message.includes("✓") ? "#d4edda" : "#f8d7da",
            borderColor: message.includes("✓") ? "#c3e6cb" : "#f5c6cb",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: "20px",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.2s",
    width: "100%",
    maxWidth: "300px",
  },
  message: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid",
    fontSize: "14px",
  },
};

export default TestButton;
