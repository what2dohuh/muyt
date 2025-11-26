"""
Python Microservice for YouTube Music
File: main.py

Install dependencies:
pip install fastapi uvicorn ytmusicapi yt-dlp

Run:
uvicorn main:app --port 5000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
import yt_dlp
from typing import Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="YouTube Music API Service")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YouTube Music client
ytmusic = YTMusic()

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "YouTube Music API",
        "endpoints": ["/search", "/stream/{video_id}", "/song/{video_id}"]
    }

@app.get("/search")
def search_music(q: str, limit: int = 20):
    """
    Search YouTube Music
    
    Parameters:
    - q: Search query
    - limit: Number of results (default 20)
    
    Example: http://localhost:5000/search?q=bohemian%20rhapsody
    """
    try:
        logger.info(f"Searching for: {q}")
        results = ytmusic.search(q, filter="songs", limit=limit)
        
        # Clean up results to include only essential data
        cleaned_results = []
        for item in results:
            cleaned_results.append({
                "videoId": item.get("videoId"),
                "title": item.get("title"),
                "artists": [artist.get("name") for artist in item.get("artists", [])],
                "album": item.get("album", {}).get("name") if item.get("album") else None,
                "duration": item.get("duration"),
                "thumbnail": item.get("thumbnails", [{}])[-1].get("url") if item.get("thumbnails") else None
            })
        
        return {
            "query": q,
            "count": len(cleaned_results),
            "results": cleaned_results
        }
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/song/{video_id}")
def get_song_details(video_id: str):
    """
    Get detailed song information
    
    Example: http://localhost:5000/song/kJQP7kiw5Fk
    """
    try:
        logger.info(f"Getting song details for: {video_id}")
        song = ytmusic.get_song(video_id)
        
        return {
            "videoId": video_id,
            "title": song.get("videoDetails", {}).get("title"),
            "artist": song.get("videoDetails", {}).get("author"),
            "duration": song.get("videoDetails", {}).get("lengthSeconds"),
            "thumbnail": song.get("videoDetails", {}).get("thumbnail", {}).get("thumbnails", [{}])[-1].get("url"),
            "viewCount": song.get("videoDetails", {}).get("viewCount")
        }
    except Exception as e:
        logger.error(f"Song details error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get song details: {str(e)}")

@app.get("/stream/{video_id}")
def get_stream_url(video_id: str, format: str = "bestaudio"):
    """
    Get direct audio stream URL using yt-dlp
    
    Parameters:
    - video_id: YouTube video ID
    - format: Audio format preference (default: bestaudio)
    
    Example: http://localhost:5000/stream/kJQP7kiw5Fk
    
    Note: Stream URLs expire after ~6 hours
    """
    try:
        logger.info(f"Extracting stream URL for: {video_id}")
        
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        url = f'https://music.youtube.com/watch?v={video_id}'
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Extract best audio format
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('acodec') != 'none']
            
            if not audio_formats:
                raise HTTPException(status_code=404, detail="No audio stream found")
            
            # Get best quality audio
            best_audio = max(audio_formats, key=lambda x: x.get('abr', 0) or 0)
            
            return {
                "videoId": video_id,
                "url": best_audio.get('url'),
                "title": info.get('title'),
                "duration": info.get('duration'),
                "thumbnail": info.get('thumbnail'),
                "format": best_audio.get('ext'),
                "bitrate": best_audio.get('abr'),
                "filesize": best_audio.get('filesize'),
                "note": "Stream URL expires in ~6 hours"
            }
            
    except Exception as e:
        logger.error(f"Stream extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract stream: {str(e)}")

@app.get("/health")
def health_check():
    """Check if service is healthy"""
    try:
        # Test ytmusicapi
        ytmusic.search("test", limit=1)
        return {"status": "healthy", "ytmusicapi": "ok", "yt-dlp": "ok"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
