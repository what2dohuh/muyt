import {ChevronUp,ChevronDown,Play,Trash2} from "lucide-react"
export default function PlaylistEditor({
  playlist,
  currentIndex,
  playFromPlaylist,
  deleteFromPlaylist,
  moveUp,
  moveDown,
}) {
  return (
    <div className="mb-4 bg-gray-900 p-4 rounded">
      <h2 className="text-lg font-bold mb-2">📜 Playlist</h2>

      {playlist.length === 0 && <p className="text-gray-400">Empty playlist</p>}

      {playlist.map((song, i) => (
        <div
          key={i}
          className={`flex justify-between items-center p-2 rounded ${
            i === currentIndex ? "bg-purple-800" : "bg-gray-800"
          }`}
        >
          <span>{song.title}</span>

          <div className="flex gap-2">
            <button onClick={() => moveUp(i)}>{<ChevronUp/>}</button>
            <button onClick={() => moveDown(i)}>{<ChevronDown/>} </button>
            <button onClick={() => playFromPlaylist(i)}><Play/></button>
            <button onClick={() => deleteFromPlaylist(i)}><Trash2/></button>
          </div>
        </div>
      ))}
    </div>
  );
}

