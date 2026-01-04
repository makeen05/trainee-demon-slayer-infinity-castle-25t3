// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AddResource from './pages/AddResource';
import Map from './pages/Map';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* sign in and sign up pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* map */}
        <Route path="/map" element={<Map />} />

        {/* add resource page */}
        <Route path="/add-resource" element={<AddResource />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;