// client/src/pages/SignIn.jsx
import { Link } from 'react-router-dom';
import '../Auth.css'; // Import the styles we just wrote

function SignIn() {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Welcome Back</h2>
        
        <form>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" placeholder="student@unsw.edu.au" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" placeholder="Enter your password" />
          </div>

          <button type="submit" className="auth-button">Sign In</button>
        </form>

        <Link to="/signup" className="auth-link">
          Don't have an account? Sign Up
        </Link>
        <Link to="/" className="auth-link" style={{color: '#666'}}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

export default SignIn;