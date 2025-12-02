import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">PrepTrack</h1>
        <p className="home-tagline">
          Sharpen your skills, track your progress, and ace your internship tests.
        </p>
        <p className="home-description">
          PrepTrack is your personalized practice platform — take mock tests, improve
          performance, and get ready for the companies that matter.
        </p>
        <button className="get-started-btn" onClick={() => navigate("/login")}>
          Get Started →
        </button>
      </div>
    </div>
  );
}

export default Home;
