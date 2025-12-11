import React from "react";

function BarcodeList({ barcodes, onClear }) {
  if (barcodes.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No barcodes scanned yet.</p>
        <p style={styles.hint}>
          Scan a barcode or use the test button to see results here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <h2>Scanned Barcodes ({barcodes.length})</h2>
        <button onClick={onClear} style={styles.clearButton}>
          Clear All
        </button>
      </div>

      <div style={styles.list}>
        {barcodes.map((item) => (
          <div key={item.id} style={styles.item}>
            <div style={styles.barcode}>{item.barcode}</div>
            <div style={styles.time}>
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  clearButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  list: {
    maxHeight: "500px",
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  item: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    transition: "background-color 0.2s",
  },
  barcode: {
    fontSize: "18px",
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  time: {
    fontSize: "14px",
    color: "#666",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  hint: {
    fontSize: "14px",
    marginTop: "10px",
  },
};

export default BarcodeList;
