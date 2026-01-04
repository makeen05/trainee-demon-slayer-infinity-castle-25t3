import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { searchResources } from '../utils/api';
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

// Component to update map view e.g when we do show all we change the map view to UNSW
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function Map() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const lat = parseFloat(searchParams.get('lat')) || -33.9173; // Default is UNSW
    const lng = parseFloat(searchParams.get('lng')) || 151.2313;
    const type = searchParams.get('type');

    const handleShowAll = () => {
        // Remove lat/lng from search params for all locations
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('lat');
        newParams.delete('lng');
        setSearchParams(newParams);
    };

    // calls backend search api using resource type and user position
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

                <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                    <MapUpdater center={[lat, lng]} zoom={15} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* User Location Marker (if available) */}
                    {searchParams.get('lat') && (
                        <Marker position={[lat, lng]}>
                            <Popup>
                                <strong>You are here</strong>
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
                                <div className="min-w-[200px]">
                                    <h3 className="font-bold text-lg">{resource.name}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{resource.building} • Floor {resource.floor}</p>
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded mb-2">
                                        {resource.type}
                                    </span>
                                    <p className="text-sm mb-2">{resource.description}</p>
                                    {resource.averageRating > 0 && (
                                        <div className="flex items-center text-yellow-500">
                                            {'★'.repeat(Math.round(resource.averageRating))}
                                            <span className="text-gray-400 text-xs ml-1">({resource.ratings.length})</span>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
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
