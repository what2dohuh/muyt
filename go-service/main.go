
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"
)

const (
	pythonServiceURL = "http://localhost:5000"
	serverPort       = ":8080"
)

// CORS middleware
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// Call Python microservice
func callPythonService(endpoint string) ([]byte, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Get(pythonServiceURL + endpoint)
	if err != nil {
		return nil, fmt.Errorf("failed to call Python service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Python service returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	return body, nil
}

// Health check endpoint
func handleHealth(w http.ResponseWriter, r *http.Request) {
	// Check if Python service is reachable
	_, err := callPythonService("/health")

	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":         "unhealthy",
			"go_server":      "ok",
			"python_service": "unreachable",
			"error":          err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "healthy",
		"go_server":      "ok",
		"python_service": "ok",
	})
}

// Search YouTube Music
func handleSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Missing 'q' query parameter", http.StatusBadRequest)
		return
	}

	limit := r.URL.Query().Get("limit")
	if limit == "" {
		limit = "20"
	}

	log.Printf("Search request: %s", query)

	// Call Python service
	endpoint := fmt.Sprintf("/search?q=%s&limit=%s", url.QueryEscape(query), limit)
	data, err := callPythonService(endpoint)
	if err != nil {
		log.Printf("Search error: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// Get song details
func handleSongDetails(w http.ResponseWriter, r *http.Request) {
	// Extract videoId from path: /api/song/{videoId}
	videoID := r.URL.Path[len("/api/song/"):]
	if videoID == "" {
		http.Error(w, "Missing video ID", http.StatusBadRequest)
		return
	}

	log.Printf("Song details request: %s", videoID)

	// Call Python service
	endpoint := fmt.Sprintf("/song/%s", videoID)
	data, err := callPythonService(endpoint)
	if err != nil {
		log.Printf("Song details error: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// Get stream URL
func handleStream(w http.ResponseWriter, r *http.Request) {
	// Extract videoId from path: /api/stream/{videoId}
	videoID := r.URL.Path[len("/api/stream/"):]
	if videoID == "" {
		http.Error(w, "Missing video ID", http.StatusBadRequest)
		return
	}

	log.Printf("Stream request: %s", videoID)

	// Call Python service
	endpoint := fmt.Sprintf("/stream/%s", videoID)
	data, err := callPythonService(endpoint)
	if err != nil {
		log.Printf("Stream error: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// Root endpoint
func handleRoot(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"service": "YouTube Music API Gateway",
		"status":  "running",
		"endpoints": map[string]string{
			"health":  "GET /health",
			"search":  "GET /api/search?q={query}&limit={limit}",
			"song":    "GET /api/song/{videoId}",
			"stream":  "GET /api/stream/{videoId}",
		},
		"examples": map[string]string{
			"search": "http://localhost:8080/api/search?q=bohemian%20rhapsody",
			"song":   "http://localhost:8080/api/song/kJQP7kiw5Fk",
			"stream": "http://localhost:8080/api/stream/kJQP7kiw5Fk",
		},
	})
}

func main() {
	// Register routes
	http.HandleFunc("/", enableCORS(handleRoot))
	http.HandleFunc("/health", enableCORS(handleHealth))
	http.HandleFunc("/api/search", enableCORS(handleSearch))
	http.HandleFunc("/api/song/", enableCORS(handleSongDetails))
	http.HandleFunc("/api/stream/", enableCORS(handleStream))

	// Start server
	log.Printf("Starting Go API server on port %s", serverPort)
	log.Printf("Python service URL: %s", pythonServiceURL)
	log.Printf("Make sure Python service is running on port 5000!")
	log.Println("\nEndpoints:")
	log.Println("  - http://localhost:8080/health")
	log.Println("  - http://localhost:8080/api/search?q=your+query")
	log.Println("  - http://localhost:8080/api/song/{videoId}")
	log.Println("  - http://localhost:8080/api/stream/{videoId}")

	if err := http.ListenAndServe(serverPort, nil); err != nil {
		log.Fatal(err)
	}
}
