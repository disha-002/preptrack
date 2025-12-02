import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";
import Navbar from "./Navbar";


function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // safely get data passed from TestPage
  const score = location.state?.score ?? 0; // This is a percentage (0-100)
  const correct = location.state?.correct ?? 0; // Number of correct answers
  const total = location.state?.total ?? 0; // Total questions
  const testName = location.state?.testName ?? "Mock Test";

  // fallback message if no data
  if (!location.state) {
    return (
      <div className="result-container">
        <h2>No test data found 😕</h2>
        <button onClick={() => navigate("/dashboard")}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
    <Navbar />
    <div className="result-container">
      <div className="result-card">
        <h2>🎯 Test Completed!</h2>
        <h3>{testName}</h3>
        <div className="score-display">
          <p className="score-percentage">
            Score: <strong>{score}%</strong>
          </p>
          <p className="score-details">
            You got <strong>{correct}</strong> out of <strong>{total}</strong> questions correct
          </p>
        </div>
        <div className="result-buttons">
          <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          <button onClick={() => navigate("/test", { state: { testName } })}>
            Retake Test
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Result;
