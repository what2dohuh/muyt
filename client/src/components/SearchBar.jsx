import { Search, Loader } from "lucide-react";

export default function SearchBar({ searchQuery, setSearchQuery, isSearching, onSearch }) {
  return (
    <div className="flex gap-2 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Search for songs or artists..."
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={onSearch}
        disabled={isSearching}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
      >
        {isSearching ? <Loader className="animate-spin" size={20} /> : "Search"}
      </button>
    </div>
  );
}

