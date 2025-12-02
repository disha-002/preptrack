import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";
import { register } from "../utils/api";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, name);
      setSuccess("✅ Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-header">
          <div className="logo">
            <h1 className="logo-text gradient-text">PrepTrack</h1>
            <p className="logo-subtitle">Master Your Placement Tests</p>
          </div>
        </div>

        <div className="signup-card card fade-in">
          <div className="card-header">
            <h2>Create Your Account</h2>
            <p>Join PrepTrack and start your placement preparation</p>
          </div>

          {error && (
            <div className="error-message" style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px', fontSize: '14px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="signup-form">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
              <small style={{ color: '#666', marginTop: '4px' }}>At least 6 characters</small>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary signup-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p className="login-text">
              Already have an account?{" "}
              <Link to="/login" className="login-link">
                Login here
              </Link>
            </p>
          </div>
        </div>

        <div className="features-preview">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <span>Company-Specific Tests</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <span>Real-time Analytics</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <span>Adaptive Learning</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
