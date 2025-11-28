import React, { useState, useEffect } from "react";

import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import Player from "../components/Player";
import ErrorBox from "../components/ErrorBox";
import PlaylistTabs from "../components/PlaylistTab";
import PlaylistEditor from "../components/PlaylistEditor";

import { useAudioPlayer } from "../hooks/useAudioPlayer";

const API_URL = "http://35.226.13.70/api";

export default function MusicPlayer() {
  // PLAYLIST SYSTEM (MULTIPLE)
  const [playlists, setPlaylists] = useState(() => {
    let saved = localStorage.getItem("playlists");
    return saved
      ? JSON.parse(saved)
      : [
          {
            name: "My Playlist",
            songs: [],
          },
        ];
  });

  const [activePlaylist, setActivePlaylist] = useState(() => {
    let saved = localStorage.getItem("activePlaylist");
    return saved ? Number(saved) : 0;
  });

  const currentPlaylist = playlists[activePlaylist];
  const [currentIndex, setCurrentIndex] = useState(null);

  // Persist data
  useEffect(() => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem("activePlaylist", activePlaylist);
  }, [activePlaylist]);

  // ERROR + SEARCH
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [error, setError] = useState("");

  // ADD TO ACTIVE PLAYLIST
  const addToPlaylist = (song) => {
    setPlaylists((prev) => {
      const updated = [...prev];
      const list = updated[activePlaylist].songs;

      if (!list.some((s) => s.videoId === song.videoId)) {
        list.push(song);
      }

      return updated;
    });
  };

  // PLAY FROM SPECIFIC INDEX
  const playFromPlaylist = (index) => {
    const song = currentPlaylist.songs[index];
    if (!song) return;

    setCurrentIndex(index);
    playSong(song);
  };

  // AUTOPLAY NEXT SONG
  const playNext = () => {
    if (currentIndex === null) return;

    const list = currentPlaylist.songs;
    const next = currentIndex + 1;

    if (next < list.length) {
      playFromPlaylist(next);
    } else {
      playFromPlaylist(0); // loop
    }
  };

  // AUDIO SYSTEM
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

  // SEARCH API
  const search = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/search?q=${searchQuery}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError("Search failed!");
    }

    setIsSearching(false);
  };

  // PLAY SONG DIRECTLY
  const playSong = async (song) => {
    setIsLoadingStream(true);
    setError("");

    try {
      setCurrentSong(song);
      audioRef.current.src = `${API_URL}/stream/${song.videoId}`;
      await audioRef.current.play();
    } catch (err) {
      console.error(err);
      setError("Failed to play stream: " + err);
    }

    setIsLoadingStream(false);
  };

  const [currentSong, setCurrentSong] = useState(null);

  // When clicking on search result
  const handleSelectSong = (song) => {
    let index = currentPlaylist.songs.findIndex((s) => s.videoId === song.videoId);

    if (index === -1) {
      addToPlaylist(song);
      index = currentPlaylist.songs.length - 1;
    }

    setCurrentIndex(index);
    playSong(song);
  };

  // DELETE SONG
  const deleteFromPlaylist = (index) => {
    setPlaylists((prev) => {
      const updated = [...prev];
      updated[activePlaylist].songs.splice(index, 1);
      return updated;
    });

    if (index === currentIndex) {
      audioRef.current.pause();
      setCurrentIndex(null);
      setCurrentSong(null);
    } else if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
  };
  //Dlete playlist
  const deletePlaylist = (index) => {
  // Prevent deleting final playlist
  if (playlists.length === 1) {
    alert("You must have at least one playlist.");
    return;
  }

  setPlaylists((prev) => prev.filter((_, i) => i !== index));

  // Fix active playlist index
  if (index === currentPlaylistIndex) {
    setCurrentPlaylistIndex(0);
  } else if (index < currentPlaylistIndex) {
    setCurrentPlaylistIndex((prev) => prev - 1);
  }
};


  // MOVE SONG UP
  const moveUp = (index) => {
    if (index === 0) return;

    setPlaylists((prev) => {
      const updated = [...prev];
      const list = updated[activePlaylist].songs;

      [list[index - 1], list[index]] = [list[index], list[index - 1]];
      return updated;
    });

    if (index === currentIndex) setCurrentIndex(index - 1);
  };

  // MOVE SONG DOWN
  const moveDown = (index) => {
    const list = currentPlaylist.songs;
    if (index === list.length - 1) return;

    setPlaylists((prev) => {
      const updated = [...prev];
      const list = updated[activePlaylist].songs;

      [list[index], list[index + 1]] = [list[index + 1], list[index]];
      return updated;
    });

    if (index === currentIndex) setCurrentIndex(index + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-4 text-center">Muyt</h1>

        <PlaylistTabs
          playlists={playlists}
          currentPlaylistIndex={activePlaylist}
          setCurrentPlaylistIndex={setActivePlaylist}
          setPlaylists={setPlaylists}
          deletePlaylist={deletePlaylist}
        />

        <PlaylistEditor
          playlist={currentPlaylist.songs}
          currentIndex={currentIndex}
          playFromPlaylist={playFromPlaylist}
          deleteFromPlaylist={deleteFromPlaylist}
          moveUp={moveUp}
          moveDown={moveDown}
        />

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

