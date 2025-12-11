// client/src/pages/SignUp.jsx
import { Link } from 'react-router-dom';
import '../Auth.css';

function SignUp() {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Join the Community</h2>
        
        <form>
          <div className="form-group">
            <label>Username</label>
            <input type="text" className="form-input" placeholder="e.g. MapMaster25" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" placeholder="student@unsw.edu.au" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" placeholder="Create a strong password" />
          </div>

          <button type="submit" className="auth-button">Create Account</button>
        </form>

        <Link to="/signin" className="auth-link">
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}

export default SignUp;