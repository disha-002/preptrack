import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";   // we'll add this styling file next

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // simple demo authentication (frontend only)
    if (email === "disha@example.com" && password === "12345") {
      navigate("/dashboard");
    } else {
      alert("Invalid email or password");
    }
    setIsLoading(false);
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
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;