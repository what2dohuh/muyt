import React, { useState } from "react";
import CreatePlaylistModal from "./CreatePlayListModal";
import { X } from "lucide-react";

export default function PlaylistTabs({
  playlists,
  currentPlaylistIndex,
  setCurrentPlaylistIndex,
  setPlaylists,
  deletePlaylist
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createPlaylist = (name) => {
    setPlaylists((prev) => [...prev, { name, songs: [] }]);
  };

  return (
    <div className="mb-4">

      <div className="flex gap-3 flex-wrap items-center">

        {playlists.map((pl, i) => (
          <div key={i} className="relative">
            {/* Playlist button */}
            <button
              onClick={() => setCurrentPlaylistIndex(i)}
              className={`px-4 py-2 pr-8 rounded ${
                currentPlaylistIndex === i
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {pl.name}
            </button>

            {/* Delete button */}
            <button
              onClick={() => {
                if (confirm(`Delete playlist "${pl.name}"?`)) {
                  deletePlaylist(i);
                }
              }}
              className="absolute right-0 top-0 -mr-2 -mt-1 text-gray-300 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Add Playlist Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          + Add Playlist
        </button>
      </div>

      {/* Modal */}
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createPlaylist}
      />
    </div>
  );
}

