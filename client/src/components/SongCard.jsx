import { Loader } from "lucide-react";

export default function SongCard({ song, isCurrent, isLoading, onClick,addToPlaylist }) {
  return (
    <>
    <div
      onClick={onClick}
      className={`p-4 bg-white/5 hover:bg-white/10 rounded-lg flex gap-4 cursor-pointer transition-all ${
        isCurrent ? "ring-2 ring-purple-500" : ""
      }`}
    >
      <img src={song.thumbnail} alt={song.title} className="w-16 h-16 rounded object-cover" />

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{song.title}</h3>
        <p className="text-sm text-gray-400 truncate">{song.artists?.join(", ")}</p>
      </div>

      <p className="text-sm text-gray-400">{song.duration}</p>


      {isLoading && <Loader className="animate-spin text-purple-500" size={20} />}
    </div>
    <button onClick={() => addToPlaylist(song)}>
  ➕ Add
</button>
    </>
);
}

