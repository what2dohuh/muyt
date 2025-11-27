import SongCard from "./SongCard";

export default function SearchResults({ results, currentSong, isLoading, onSelect,addToPlaylist }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Search Results</h2>
      <div className="space-y-2">
        {results.map((song) => (
          <SongCard
            key={song.videoId}
            song={song}
            onClick={() => onSelect(song)}
            isCurrent={currentSong?.videoId === song.videoId}
            isLoading={isLoading && currentSong?.videoId === song.videoId}
            addToPlaylist={addToPlaylist}
          />
        ))}
      </div>
    </div>
  );
}

