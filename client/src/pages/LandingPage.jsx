import { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

function LandingPage() {
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!selectedType) return;

        setLoading(true);   

        // get user's location to send to map
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // if location allowed,  we navigate to the map
                    navigate(`/map?type=${encodeURIComponent(selectedType)}&lat=${latitude}&lng=${longitude}`);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Could not get your location. Showing default map view.");
                    navigate(`/map?type=${encodeURIComponent(selectedType)}`);
                },
                {
                    enableHighAccuracy: false, // Use wifi location (faster) instead of GPS
                    timeout: 5000,             // Fail after 5 seconds
                    maximumAge: Infinity       // Use cached location if available
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            navigate(`/map?type=${encodeURIComponent(selectedType)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Main content */}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-2xl w-full text-center">
                    {/* Title */}
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        🗺️ Resource Tracker
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Find campus resources instantly
                    </p>

                    {/* Resource Type Selector */}
                    <form onSubmit={handleSearch} className="w-full space-y-4">
                        <div className="flex gap-4">
                            <select 
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select a resource type...</option>
                                <option value="Toilet">🚻 Toilet</option>
                                <option value="Water Fountain">💧 Water Fountain</option>
                                <option value="Microwave">🔥 Microwave</option>
                                <option value="Vending Machine">🍫 Vending Machine</option>
                                <option value="WiFi Hotspot">📶 WiFi Hotspot</option>
                                <option value="Power Outlet">🔌 Power Outlet</option>
                                <option value="Other">📍 Other</option>
                            </select>

                            <button
                                type="submit"
                                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={!selectedType || loading}
                            >
                                {loading ? 'Locating...' : 'Find'}
                            </button>
                        </div>

                        {selectedType && (
                            <p className="text-sm text-gray-500">
                                Looking for <span className="font-semibold text-blue-600">{selectedType}</span> near you
                            </p>
                        )}
                    </form>
                </div>
            </div>

            {/* Floating Upload Button - Bottom Right */}
            <Link to="/add-resource">
                <button 
                    className="fixed bottom-8 right-8 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center font-semibold"
                    aria-label="Upload Resource"
                >
                    ➕ Upload Resource
                </button>
            </Link>
        </div>
    );
}

export default LandingPage;