import React from "react";

function StatusBar({ isConnected, error }) {
  const statusStyle = {
    ...styles.statusBar,
    backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
    borderColor: isConnected ? "#c3e6cb" : "#f5c6cb",
  };

  return (
    <div style={statusStyle}>
      <div style={styles.statusContent}>
        <span style={styles.statusIcon}>{isConnected ? "✓" : "✗"}</span>
        <span style={styles.statusText}>
          {isConnected ? "Connected to Scanner" : "Disconnected"}
        </span>
        {error && <span style={styles.error}> - {error}</span>}
      </div>
    </div>
  );
}

const styles = {
  statusBar: {
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid",
  },
  statusContent: {
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
  },
  statusIcon: {
    marginRight: "10px",
    fontSize: "20px",
    fontWeight: "bold",
  },
  statusText: {
    fontWeight: "500",
  },
  error: {
    color: "#721c24",
    marginLeft: "10px",
  },
};

export default StatusBar;
