// import LandingPage from './pages/LandingPage';

// function App() {
//   return <LandingPage />;
// }

// export default App;

// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AddResource from './pages/AddResource'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. The Home Page (http://localhost:5173/) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 2. The Auth Pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* 3. The Map Page (http://localhost:5173/map) 
            You might want to redirect users here after they sign in later. */}
        <Route path="/map" element={<Map />} />

        <Route path="/add-resource" element={<AddResource />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;