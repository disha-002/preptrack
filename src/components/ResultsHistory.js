import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResultsHistory.css";
import Navbar from "./Navbar";

function ResultsHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(userStr);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        console.log("Fetching attempts for user:", user.userId);

        // Fetch past attempts
        const response = await fetch(
          `http://localhost:4000/api/users/${user.userId}/attempts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch attempts: ${response.status}`);
        }

        const data = await response.json();
        console.log("Attempts fetched:", data);
        setAttempts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching attempts:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [navigate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="results-history-container">
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="results-history-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="results-history-container">
          <div className="no-results">
            <h2>📊 No Test Results Yet</h2>
            <p>You haven't completed any tests yet.</p>
            <button onClick={() => navigate("/dashboard")}>Take a Test</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="results-history-container">
        <div className="results-header">
          <h1>📈 Your Test Results</h1>
          <p>{attempts.length} test{attempts.length !== 1 ? "s" : ""} completed</p>
        </div>

        <div className="results-stats">
          <div className="stat-card">
            <h3>Average Score</h3>
            <p className="stat-value">
              {Math.round(
                attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
              )}%
            </p>
          </div>
          <div className="stat-card">
            <h3>Best Score</h3>
            <p className="stat-value">
              {Math.max(...attempts.map((a) => a.score))}%
            </p>
          </div>
          <div className="stat-card">
            <h3>Total Tests</h3>
            <p className="stat-value">{attempts.length}</p>
          </div>
        </div>

        <div className="attempts-list">
          <h2>Test Attempts</h2>
          <table className="attempts-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Questions</th>
                <th>Time Taken</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt, idx) => (
                <tr key={idx} className="attempt-row">
                  <td className="company-name">{attempt.company || "N/A"}</td>
                  <td>
                    <span
                      className="score-badge"
                      style={{
                        backgroundColor: getScoreColor(attempt.score),
                      }}
                    >
                      {attempt.score}%
                    </span>
                  </td>
                  <td>{Math.round(attempt.accuracy * 100)}%</td>
                  <td>
                    {attempt.correct}/{attempt.total}
                  </td>
                  <td>{formatTime(attempt.timeSpent)}</td>
                  <td className="date">{formatDate(attempt.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ResultsHistory;
