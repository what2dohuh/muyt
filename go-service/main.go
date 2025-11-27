package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

const (
	pythonServiceURL = "http://localhost:5000"
	serverPort       = ":8080"
)

// Custom transport for streaming endpoints (NO TIMEOUT)
var streamingTransport = &http.Transport{
	MaxIdleConns:        100,
	IdleConnTimeout:     90 * time.Second,
	TLSHandshakeTimeout: 10 * time.Second,
	// No ResponseHeaderTimeout or other timeouts
}

// Regular transport for non-streaming endpoints (WITH TIMEOUT)
var regularTransport = &http.Transport{
	MaxIdleConns:          100,
	IdleConnTimeout:       90 * time.Second,
	TLSHandshakeTimeout:   10 * time.Second,
	ResponseHeaderTimeout: 30 * time.Second,
}

func main() {
	http.HandleFunc("/health", healthCheck)
	http.HandleFunc("/api/search", handleSearch)
	http.HandleFunc("/api/song/", handleSong)
	http.HandleFunc("/api/stream/", handleStream) // Special handling for streaming

	log.Printf("Go API Gateway running on %s", serverPort)
	log.Printf("Proxying to Python service at %s", pythonServiceURL)
	log.Fatal(http.ListenAndServe(serverPort, nil))
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "Go API Gateway",
	})
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Missing query parameter 'q'", http.StatusBadRequest)
		return
	}

	// Use regular client with timeout for search
	client := &http.Client{
		Timeout:   30 * time.Second,
		Transport: regularTransport,
	}

	url := fmt.Sprintf("%s/search?q=%s&limit=%s", pythonServiceURL, query, r.URL.Query().Get("limit"))
	resp, err := client.Get(url)
	if err != nil {
		log.Printf("Error calling Python service: %v", err)
		http.Error(w, "Failed to search", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read Python response
	var pythonResponse struct {
		Query   string        `json:"query"`
		Count   int           `json:"count"`
		Results []interface{} `json:"results"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&pythonResponse); err != nil {
		log.Printf("Error decoding response: %v", err)
		http.Error(w, "Failed to decode response", http.StatusInternalServerError)
		return
	}

	// Wrap for frontend
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"results": pythonResponse.Results,
	})
}

func handleSong(w http.ResponseWriter, r *http.Request) {
	// Extract video ID from path
	videoID := r.URL.Path[len("/api/song/"):]
	if videoID == "" {
		http.Error(w, "Missing video ID", http.StatusBadRequest)
		return
	}

	// Use regular client with timeout for song details
	client := &http.Client{
		Timeout:   30 * time.Second,
		Transport: regularTransport,
	}

	url := fmt.Sprintf("%s/song/%s", pythonServiceURL, videoID)
	resp, err := client.Get(url)
	if err != nil {
		log.Printf("Error calling Python service: %v", err)
		http.Error(w, "Failed to get song details", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func handleStream(w http.ResponseWriter, r *http.Request) {
	// Extract video ID from path
	videoID := r.URL.Path[len("/api/stream/"):]
	if videoID == "" {
		http.Error(w, "Missing video ID", http.StatusBadRequest)
		return
	}

	log.Printf("Streaming request for video ID: %s", videoID)

	// CRITICAL: Use client WITHOUT timeout for streaming
	client := &http.Client{
		Transport: streamingTransport,
		// NO Timeout set - allow indefinite streaming
	}

	streamURL := fmt.Sprintf("%s/stream/%s", pythonServiceURL, videoID)
	
	// Create request to Python service
	req, err := http.NewRequest("GET", streamURL, nil)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		http.Error(w, "Failed to create stream request", http.StatusInternalServerError)
		return
	}

	// Make the request
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error calling Python service: %v", err)
		http.Error(w, "Failed to get stream", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Python service returned status: %d", resp.StatusCode)
		http.Error(w, "Failed to get stream", resp.StatusCode)
		return
	}

	// Set headers for streaming
	w.Header().Set("Content-Type", "audio/webm")
	w.Header().Set("Accept-Ranges", "bytes")
	w.Header().Set("Cache-Control", "no-cache")
	
	// Copy headers from Python response
	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}

	// Stream the response - copy chunks as they arrive
	// This will continue until the entire audio file is streamed
	written, err := io.Copy(w, resp.Body)
	if err != nil {
		log.Printf("Error streaming audio (after %d bytes): %v", written, err)
		return
	}

	log.Printf("Successfully streamed %d bytes for video ID: %s", written, videoID)
}

// Alternative: Use reverse proxy for streaming (simpler but less control)
func handleStreamWithProxy(w http.ResponseWriter, r *http.Request) {
	target, _ := url.Parse(pythonServiceURL)
	proxy := httputil.NewSingleHostReverseProxy(target)
	
	// Customize the transport to disable timeout
	proxy.Transport = streamingTransport
	
	// Modify the request path
	r.URL.Path = "/stream" + r.URL.Path[len("/api/stream"):]
	
	proxy.ServeHTTP(w, r)
}
