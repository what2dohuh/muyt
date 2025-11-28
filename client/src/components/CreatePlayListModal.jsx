import React, { useState } from "react";

export default function CreatePlaylistModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-80 border border-white/10 animate-scaleIn">

        <h2 className="text-lg font-semibold mb-3 text-white">Create New Playlist</h2>

        <input
          type="text"
          placeholder="Playlist name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 mb-4 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

