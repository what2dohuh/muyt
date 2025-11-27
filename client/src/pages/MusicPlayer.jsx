import React, { useState, useEffect } from "react";

import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import Player from "../components/Player";
import ErrorBox from "../components/ErrorBox";

import { useAudioPlayer } from "../hooks/useAudioPlayer";

const API_URL = "http://35.226.13.70/api";

export default function MusicPlayer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [error, setError] = useState("");

  // Playlist states
  const [playlist, setPlaylist] = useState(() => {
    const saved = localStorage.getItem("playlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentIndex, setCurrentIndex] = useState(null);

  // Save playlist to localStorage
  useEffect(() => {
    localStorage.setItem("playlist", JSON.stringify(playlist));
  }, [playlist]);

  // ADD TO PLAYLIST
  const addToPlaylist = (song) => {
    if (!playlist.some((s) => s.videoId === song.videoId)) {
      setPlaylist((prev) => [...prev, song]);
    }
  };

  // PLAY FROM PLAYLIST
  const playFromPlaylist = (index) => {
    const song = playlist[index];
    if (!song) return;

    setCurrentIndex(index);
    playSong(song);
  };


  // AUTO PLAY NEXT SONG
  const playNext = () => {
  console.log("playNext called | currentIndex =", currentIndex);

  if (currentIndex === null) {
    console.log("No currentIndex");
    return;
  }

  const nextIndex = currentIndex + 1;
  console.log("Next index =", nextIndex);

  if (nextIndex < playlist.length) {
    console.log("Calling playFromPlaylist(nextIndex)");
    playFromPlaylist(nextIndex);
  } else {
      playFromPlaylist(0)
  }
};

  // Initialize audio hook AFTER defining playNext
  const {
    audioRef,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    volume,
    changeVolume,
    isMuted,
    toggleMute,
  } = useAudioPlayer(playNext);

  // SEARCH
  const search = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/search?q=${searchQuery}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Search failed");
    }

   setIsSearching(false);
  };

  // PLAY SONG DIRECTLY
  const playSong = async (song) => {
  setIsLoadingStream(true);
  setError("");

  try {
    setCurrentSong(song);
    // Directly set stream URL
    audioRef.current.src = `${API_URL}/stream/${song.videoId}`;
    await audioRef.current.play();
  } catch (err) {
    console.error(err);
    setError("Failed to play stream: " + err);
  }

  setIsLoadingStream(false);
};

  const handleSelectSong = async (song) => {
  // Check if song already exists in playlist
  let index = playlist.findIndex(s => s.videoId === song.videoId);

  // If not in playlist, add it
  if (index === -1) {
    setPlaylist(prev => [...prev, song]);
    index = playlist.length; // new index
  }

  // Set the current index
  setCurrentIndex(index);

  // Play that song
  playSong(song);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">🎵 Music Player</h1>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          onSearch={search}
        />

        {error && <ErrorBox message={error} />}

        <SearchResults
          results={results}
          currentSong={currentSong}
          isLoading={isLoadingStream}
          onSelect={handleSelectSong}
          addToPlaylist={addToPlaylist}
        />

        {currentSong && (
          <Player
            song={currentSong}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            volume={volume}
            onVolumeChange={changeVolume}
            isMuted={isMuted}
            toggleMute={toggleMute}
          />
        )}
      </div>

      <audio ref={audioRef} />
    </div>
  );
}

