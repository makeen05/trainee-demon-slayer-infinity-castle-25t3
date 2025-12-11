import { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function LandingPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
        // TODO: Add search functionality later
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

                    {/* Search Bar, the OnSubmit fires when i click enter */}
                    <form onSubmit={handleSearch} className="w-full">
                    <input
                        type="text"
                        placeholder="Search for resource..."
                        value={searchQuery}
                        // Fires everytime i type something in search bar
                        // Causes react to rerender cus we setSearchQuery to something new, rerenders for every new letter typed
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </form>
                </div>
            </div>
            {/* Floating Upload Button - Bottom Right */}
            <Link to="/add-resource">
                <button 
                    className="fixed bottom-8 right-8 w-30 h-30 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl"
                    aria-label="Upload Resource"
                >
                    Upload Resource
                </button>
            </Link>
        </div>
    );
    }

export default LandingPage;