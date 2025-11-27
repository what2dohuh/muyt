import { Trash2, ArrowUp, ArrowDown, Play } from "lucide-react";

export default function PlaylistEditor({ playlist, currentIndex, playFromPlaylist, deleteFromPlaylist, moveUp, moveDown }) {
  return (
    <div className="bg-white/10 p-4 rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-3">📄 Playlist</h2>

      {playlist.length === 0 && (
        <p className="text-gray-400 text-sm">No songs in playlist.</p>
      )}

      {playlist.map((song, index) => (
        <div
          key={song.videoId}
          className={`flex items-center justify-between p-3 mb-2 rounded ${
            currentIndex === index ? "bg-purple-600/40" : "bg-white/5"
          }`}
        >
          <div>
            <p className="font-medium">{song.title}</p>
            <p className="text-gray-400 text-xs">{song.artists?.join(", ")}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => playFromPlaylist(index)}>
              <Play size={18} className="text-green-400" />
            </button>
            <button onClick={() => moveUp(index)}>
              <ArrowUp size={18} className="text-blue-300" />
            </button>
            <button onClick={() => moveDown(index)}>
              <ArrowDown size={18} className="text-blue-300" />
            </button>
            <button onClick={() => deleteFromPlaylist(index)}>
              <Trash2 size={18} className="text-red-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

