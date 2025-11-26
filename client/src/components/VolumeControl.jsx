import { Volume2, VolumeX } from "lucide-react";

export default function VolumeControl({ volume, isMuted, onVolumeChange, onMuteToggle }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onMuteToggle}>
        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
<input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={volume}
  onChange={(e) => onVolumeChange(Number(e.target.value))}
  className="w-24 h-1 bg-gray-700 rounded cursor-pointer"
/>

    </div>
  );
}

