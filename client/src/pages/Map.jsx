import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { searchResources, rateResource } from '../utils/api';
import Navbar from '../components/Navbar';
import L from 'leaflet';

// Fix for default marker icon in leaflet with react
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom RED CIRCLE icon for user location
const UserLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #325aed;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Component to update map view e.g when we do show all we change the map view to UNSW
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Helper function to calculate distance between two points in meters
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Popup to handle rating state and directions
function ResourcePopup({ resource, userLocation, onRatingUpdate, onShowDirections }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleRate = async (value) => {
    setSubmitting(true);
    setError(null);
    try {
      const updatedResource = await rateResource(resource._id, value);
      onRatingUpdate(updatedResource);
      alert('Rating submitted!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("You've already rated this.");
      } else if (err.response && err.response.status === 401) {
        setError("Please login to rate.");
      } else {
        setError("Failed to submit rating.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate distance if user location is available
  const distance = userLocation 
    ? calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        resource.location.coordinates[1], 
        resource.location.coordinates[0]
      )
    : null;

  return (
    <div className="min-w-[200px]">
      <h3 className="font-bold text-lg">{resource.name}</h3>
      <p className="text-sm text-gray-600 mb-1">{resource.building} • Floor {resource.floor}</p>
      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded mb-2">
          {resource.type}
      </span>
      <p className="text-sm mb-2">{resource.description}</p>
      
      {/* Distance Display */}
      {distance !== null && (
        <p className="text-xs text-gray-500 mb-2">
          📍 {distance < 1000 
            ? `${Math.round(distance)}m away` 
            : `${(distance / 1000).toFixed(1)}km away`}
        </p>
      )}

      {/* Average Rating Display */}
      {resource.averageRating > 0 ? (
          <div className="flex items-center text-yellow-500 mb-2">
              <span className="text-lg mr-1">{resource.averageRating.toFixed(1)}</span>
              {'★'}
              <span className="text-gray-400 text-xs ml-1">({resource.ratings.length} reviews)</span>
          </div>
      ) : (
        <p className="text-xs text-gray-500 mb-2">No ratings yet</p>
      )}

      {/* Directions Button */}
      {userLocation && (
        <button
          onClick={() => onShowDirections(resource)}
          className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded mb-2 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          🧭 Get Directions
        </button>
      )}

      {/* Rater Input */}
      <div className="border-t pt-2 mt-2">
        <p className="text-xs font-bold text-gray-500 mb-1">Rate this resource:</p>
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              disabled={submitting}
              className={`text-lg hover:scale-110 transition-transform ${submitting ? 'opacity-50' : 'hover:text-yellow-500 text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function Map() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [directionsTo, setDirectionsTo] = useState(null);

    const lat = parseFloat(searchParams.get('lat')) || -33.9173; // Default is UNSW
    const lng = parseFloat(searchParams.get('lng')) || 151.2313;
    const type = searchParams.get('type');

    const userLocation = searchParams.get('lat') ? { lat, lng } : null;

    const handleShowAll = () => {
        // Remove lat/lng from search params for all locations
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('lat');
        newParams.delete('lng');
        setSearchParams(newParams);
    };

    const handleShowDirections = (resource) => {
        if (!userLocation) {
            alert('Your location is not available');
            return;
        }
        setDirectionsTo(resource);
    };

    const handleClearDirections = () => {
        setDirectionsTo(null);
    };

    // calls backend search api using resource type and user position
    const handleRatingUpdate = (updatedResource) => {
        setResources(prevResources => 
            prevResources.map(r => r._id === updatedResource._id ? updatedResource : r)
        );
    };

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const params = {
                    q: type,
                    lat: searchParams.get('lat'),
                    lng: searchParams.get('lng')
                };
                
                const data = await searchResources(params);
                setResources(data);
                
                if (data.length === 0) {
                    setError(`No ${type || 'resources'} found within 5km.`);
                } else {
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching resources:", err);
                setError("Failed to load resources.");
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [type, searchParams]);

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            
            <div className="flex-1 relative z-0">
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-white bg-opacity-75 flex items-center justify-center">
                        <p className="text-xl font-semibold text-blue-600 animate-pulse">Loading map...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg flex flex-col items-center gap-2">
                        <p>{error}</p>
                        {searchParams.get('lat') && (
                            <button 
                                onClick={handleShowAll}
                                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                            >
                                Show All Locations
                            </button>
                        )}
                    </div>
                )}

                {/* Clear Directions Button */}
                {directionsTo && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg flex items-center gap-3">
                        <p className="font-semibold">
                            🧭 Directions to {directionsTo.name}
                        </p>
                        <button 
                            onClick={handleClearDirections}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                )}

                <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                    <MapUpdater center={[lat, lng]} zoom={15} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* User Location Marker (RED CIRCLE) */}
                    {userLocation && (
                        <Marker position={[lat, lng]} icon={UserLocationIcon}>
                            <Popup>
                                <strong>📍 You are here</strong>
                            </Popup>
                        </Marker>
                    )}

                    {/* Resource Markers */}
                    {resources.map(resource => (
                        <Marker 
                            key={resource._id} 
                            position={[resource.location.coordinates[1], resource.location.coordinates[0]]}
                        >
                            <Popup>
                                <ResourcePopup 
                                    resource={resource} 
                                    userLocation={userLocation}
                                    onRatingUpdate={handleRatingUpdate}
                                    onShowDirections={handleShowDirections}
                                />
                            </Popup>
                        </Marker>
                    ))}

                    {/* Directions Line (Green with Arrow) */}
                    {directionsTo && userLocation && (
                        <Polyline
                            positions={[
                                [lat, lng],
                                [directionsTo.location.coordinates[1], directionsTo.location.coordinates[0]]
                            ]}
                            color="black"
                            weight={4}
                            dashArray="10, 10"
                            lineCap="round"
                        />
                    )}
                </MapContainer>

                {/* Floating Add Button */}
                <Link to="/add-resource">
                    <button 
                        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl z-[1000]"
                        aria-label="Upload Resource"
                    >
                        +
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Map;