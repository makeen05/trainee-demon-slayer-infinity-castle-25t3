// client/src/pages/AddResource.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'; // Import Leaflet tools
import 'leaflet/dist/leaflet.css';
import '../Auth.css';

// Handles clicking on the map 
function LocationPicker({ setCoordinates }) {
  useMapEvents({
    click(e) {
      // When user clicks the map, grab the Lat/Lng
      setCoordinates({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });
  return null; // doesn't render anything 
}

function AddResource() {
  const navigate = useNavigate();

  // 1. Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Toilet', // Default
    customCategory: '', // Used if "Other" is selected
    building: '',
    level: '',
    description: '',
  });

  // 2. Location State
  const [coordinates, setCoordinates] = useState({ lat: -33.9173, lng: 151.2313 }); // Default: UNSW Library
  const [usingMyLocation, setUsingMyLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 3. Image State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a fake URL to preview the image immediately
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle GPS Button
  const handleGpsClick = () => {
    setLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setUsingMyLocation(true);
        setLoadingLocation(false);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Logic: If category is "Other", use the custom text. Otherwise use the dropdown.
    const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;

    const finalData = {
      ...formData,
      category: finalCategory,
      location: coordinates,
      image: imageFile ? imageFile.name : "No Image" // TODO, handling image uploads
    };

    console.log("Submitting:", finalData);
    alert("Resource Added!");
    navigate('/map');
  };

  return (
    <div className="auth-container" style={{height: 'auto', padding: '50px 0'}}>
      <div className="auth-form" style={{ maxWidth: '600px' }}>
        <h2 className="auth-title">Add New Resource</h2>
        
        <form onSubmit={handleSubmit}>

          {/* --- CATEGORY SECTION --- */}
          <div className="form-group">
            <label>Category</label>
            <select 
              name="category" 
              className="form-input" 
              value={formData.category} 
              onChange={handleChange}
            >
              <option value="Toilet">Toilet</option>
              <option value="Water">Water Station</option>
              <option value="Microwave">Microwave</option>
              <option value="Vending">Vending Machine</option>
              <option value="Wifi">Wifi Spot</option>
              <option value="Outlet">Power Outlet</option>
              <option value="StudySpot">Study Spot</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Conditional Input: Only shows if "Other" is selected */}
          {formData.category === 'Other' && (
            <div className="form-group">
              <input 
                type="text" 
                name="customCategory" 
                className="form-input" 
                placeholder="What type of resource is this?"
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* --- DETAILS SECTION --- */}
          <div className="form-group">
            <label>Name / Description</label>
            <input type="text" name="name" className="form-input" placeholder="e.g. Group Study Spot" onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Building</label>
              <input type="text" name="building" className="form-input" placeholder="e.g. Quad" onChange={handleChange} />
            </div>
            <div className="form-group" style={{ width: '100px' }}>
              <label>Level</label>
              <input type="text" name="level" className="form-input" placeholder="" onChange={handleChange} />
            </div>
          </div>

          {/* --- PHOTO UPLOAD SECTION --- */}
          <div className="form-group">
            <label style={{ marginBottom: '8px', display: 'block' }}>Add a Photo</label>
            
            {/* 1. Real Input (Hidden) */}
            <input 
              type="file" 
              id="hidden-file-input" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{ display: 'none' }} // Hides default button
            />

            {/* 2. The Custom Button (Label) */}
            <label 
              htmlFor="hidden-file-input" 
              className="form-input"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                border: '2px dashed #cbd5e1', 
                padding: '20px',
                textAlign: 'center',
                color: '#64748b'
              }}
            >
              {/* Change text based on whether file is selected */}
              {imageFile ? (
                <span style={{ color: '#2563EB', fontWeight: 'bold' }}>
                   📸 {imageFile.name} (Click to change)
                </span>
              ) : (
                <span>Click to Upload Image</span>
              )}
            </label>

            {/* 3. The Preview */}
            {imagePreview && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                />
              </div>
            )}
          </div>

          {/* --- LOCATION SECTION (MAP PIN) --- */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ margin: 0 }}>Pin Location</label>
              <button 
                type="button" 
                onClick={handleGpsClick}
                style={{ background: '#2563EB', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {loadingLocation ? "Locating..." : "Use My Location"}
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
              Tap on the map to place the marker exactly where the item is.
            </p>

            {/* MINI MAP */}
            <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #eee' }}>
              <MapContainer 
                center={[-33.9173, 151.2313]} 
                zoom={17} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Visual Marker showing selection */}
                <Marker position={[coordinates.lat, coordinates.lng]} />
                
                {/* Invisible helper detecting clicks */}
                <LocationPicker setCoordinates={setCoordinates} />
              </MapContainer>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px', textAlign: 'right' }}>
              Selected: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </p>
          </div>

          <button type="submit" className="auth-button">Submit Resource</button>
          <Link to="/ " className="auth-link" style={{color: '#666'}}>Cancel</Link>

        </form>
      </div>
    </div>
  );
}

export default AddResource;