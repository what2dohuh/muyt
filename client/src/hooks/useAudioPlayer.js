import { useState, useEffect, useRef } from "react";

export const useAudioPlayer = () => {
  const audioRef = useRef(new Audio());

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update progress + duration
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  // SEEK FUNCTION
  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // VOLUME FUNCTION
  const changeVolume = (v) => {
    audioRef.current.volume = v;
    setVolume(v);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  // PLAY / PAUSE
  const togglePlay = () => {
    const audio = audioRef.current;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return {
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
  };
};

