import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";   

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Call backend login endpoint
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <div className="logo">
            <h1 className="logo-text gradient-text">PrepTrack</h1>
            <p className="logo-subtitle">Master Your Placement Tests</p>
          </div>
        </div>
        
        <div className="login-card card fade-in">
          <div className="card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your preparation journey</p>
          </div>

          {error && (
            <div className="error-message" style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="login-form">
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>
          
          <div className="form-footer">
            <p className="signup-text">
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Create Account
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

export default Login;