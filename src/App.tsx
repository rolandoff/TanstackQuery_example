/**
 * Developer: Rolando Fernandez
 * Date: Dec, 5th 2025
 */

import { useState, FormEvent } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import "./styles.css";

const API_URL = "https://api.giphy.com/v1/gifs/search";
const API_KEY = "basVLIQ3N8MWIXZAywCc6vam7qF3S8QA";

// Just create a basic client with defaults
const queryClient = new QueryClient();

interface GifImage {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
  };
  title: string;
}

interface GiphyResponse {
  data: GifImage[];
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [selectedImages, setSelectedImages] = useState<GifImage[]>([]);

  const {
    data: images = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["gifs", activeSearchTerm],
    queryFn: () =>
      fetch(`${API_URL}?api_key=${API_KEY}&q=${activeSearchTerm}&limit=20`)
        .then((r) => r.json())
        .then((data: GiphyResponse) => data.data),
    enabled: activeSearchTerm.length > 0,
  });

  const isSearching = isPending && activeSearchTerm.length > 0;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    if (!searchTerm.trim()) {
      alert("Please enter a search term");
      return;
    }

    setActiveSearchTerm(searchTerm);
  };

  const toggleImageSelection = (image: GifImage) => {
    const isSelected = selectedImages.some((img) => img.id === image.id);

    if (isSelected) {
      setSelectedImages(selectedImages.filter((img) => img.id !== image.id));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handlePay = () => {
    if (selectedImages.length === 0) {
      alert("Please select at least one image");
      return;
    }

    alert(`Processing payment for ${selectedImages.length} image(s)!`);
    console.log("Selected images:", selectedImages);
    setSelectedImages([]);
  };

  return (
    <div className="app">
      <div
        className={`search-container ${images.length === 0 ? "centered" : ""}`}
      >
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for GIFs..."
            className="search-input"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="search-button"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            Error loading GIFs. Please try again.
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((image) => {
            const isSelected = selectedImages.some(
              (img) => img.id === image.id
            );

            return (
              <div
                key={image.id}
                className={`image-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleImageSelection(image)}
                title={`Click to ${isSelected ? "deselect" : "select"}`}
              >
                <img src={image.images.fixed_height.url} alt={image.title} />
              </div>
            );
          })}
        </div>
      )}

      {selectedImages.length > 0 && (
        <div className="footer">
          <div className="selected-images">
            {selectedImages.map((image) => (
              <div key={image.id} className="footer-image">
                <img src={image.images.fixed_height.url} alt={image.title} />
              </div>
            ))}
          </div>
          <button onClick={handlePay} className="pay-button">
            Pay ({selectedImages.length})
          </button>
        </div>
      )}
    </div>
  );
}

// This wrapper is required for TanStack Query to work
export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
