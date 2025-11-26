import { Play, Pause } from "lucide-react";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";

export default function Player({
  song,
  isPlaying,
  togglePlay,
  audioRef,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  toggleMute
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 p-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-3">
          <img src={song.thumbnail} className="w-14 h-14 rounded" />
          <div className="flex-1">
            <h3 className="font-medium">{song.title}</h3>
            <p className="text-sm text-gray-400">{song.artists?.join(", ")}</p>
          </div>
        </div>

        <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

        <div className="flex justify-between items-center">
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onMuteToggle={toggleMute}
          />
        </div>

      </div>
      <audio ref={audioRef} />
    </div>
  );
}

