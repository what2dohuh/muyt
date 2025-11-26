// src/components/ErrorBox.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBox({ message }) {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 text-red-200 rounded-lg flex items-center gap-3">
      <AlertTriangle size={20} className="text-red-300" />
      <span>{message}</span>
    </div>
  );
}

