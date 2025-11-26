import { formatTime } from "../utils/formatTime";

export default function ProgressBar({ currentTime, duration, onSeek }) {
  return (
    <div className="mb-3">
     <input
  type="range"
  min="0"
  max={duration || 0}
  value={currentTime}
  onChange={(e) => onSeek(Number(e.target.value))}
  className="w-full h-1 bg-gray-700 rounded-lg cursor-pointer"
/>

      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

