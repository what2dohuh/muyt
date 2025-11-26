import React, { useState } from "react";

import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import Player from "../components/Player";
import ErrorBox from "../components/ErrorBox";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
const API_URL = "http://localhost:8080/api";

export default function MusicPlayer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [error, setError] = useState("");
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
} = useAudioPlayer();

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

  // PLAY SONG
  const playSong = async (song) => {
    setIsLoadingStream(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/stream/${song.videoId}`);
      const data = await res.json();

      if (data.url) {
        console.log(data.url)
        setCurrentSong(song);
        audioRef.current.src = data.url;
        audioRef.current.play();
      }
    } catch (err) {
      setError("Failed to load stream :"+err);
    }

    setIsLoadingStream(false);
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
          onSelect={playSong}
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

