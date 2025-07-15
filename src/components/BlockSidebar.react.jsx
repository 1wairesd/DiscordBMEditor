import React, { useState, useEffect } from "react";

export default function BlockSidebar({ node, onChange, onDelete, isRoot }) {
  const [localNode, setLocalNode] = useState(node || {});

  useEffect(() => {
    setLocalNode(node || {});
  }, [node]);

  const handleChange = (field, value) => {
    const updated = { ...localNode, [field]: value };
    setLocalNode(updated);
    onChange && onChange(updated);
  };

  return (
    <div style={{ padding: 16, width: 320 }}>
      <h3>{isRoot ? "Root Block" : "Block Properties"}</h3>
      <div style={{ marginBottom: 12 }}>
        <label>Name:</label>
        <input
          value={localNode.name || ""}
          onChange={e => handleChange("name", e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Description:</label>
        <input
          value={localNode.description || ""}
          onChange={e => handleChange("description", e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
      {/* Добавь другие поля по необходимости */}
      {!isRoot && (
        <button onClick={onDelete} style={{ color: "red", marginTop: 16 }}>
          Delete Block
        </button>
      )}
    </div>
  );
} 