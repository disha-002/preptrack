import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Navbar from "./Navbar";
import { getPatterns, startTest } from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingTest, setStartingTest] = useState(null);

  const fetchPatterns = useCallback(async () => {
    try {
      const data = await getPatterns();
      setPatterns(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      setLoading(false);
    }
  }, []);

  // Fetch patterns from API
  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const handleStartTest = useCallback(async (patternId, patternName) => {
    setStartingTest(patternId);
    try {
      const testData = await startTest(patternId);
      
      // Navigate to test page with pattern data
      navigate("/test", { 
        state: { 
          patternId,
          attemptId: testData.attemptId,
          company: testData.company,
          testName: patternName,
          timeLimitSeconds: testData.timeLimitSeconds,
          totalQuestions: testData.totalQuestions,
          sections: testData.sections,
          questions: testData.questions
        } 
      });
    } catch (error) {
      console.error('Error starting test:', error);
      setStartingTest(null);
    }
  }, [navigate]);

  // Group patterns by company
  const groupedPatterns = patterns.reduce((acc, pattern) => {
    const company = pattern.company;
    if (!acc[company]) acc[company] = [];
    acc[company].push(pattern);
    return acc;
  }, {});

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading">Loading patterns...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="welcome-text">Welcome to PrepTrack 🎯</h1>
        <p className="subtitle">Choose a company test to begin your placement preparation!</p>

        {/* Patterns grouped by company */}
        {Object.entries(groupedPatterns).map(([company, companyPatterns]) => (
          <div key={company} className="company-section">
            <h2 className="company-title">{company}</h2>
            <div className="tests-grid">
              {companyPatterns.map((pattern) => (
                <div key={pattern.id} className="test-card">
                  <h3>{pattern.name}</h3>
                  <p className="pattern-description">{pattern.description}</p>
                  <div className="test-details">
                    <p><strong>Questions:</strong> {pattern.totalQuestions}</p>
                    <p><strong>Time:</strong> {Math.floor(pattern.timeLimitSeconds / 60)} minutes</p>
                    <p><strong>Sections:</strong></p>
                    <ul className="sections-list">
                      {pattern.sections.map((section, idx) => (
                        <li key={idx}>
                          {section.topic}: {section.count} questions
                        </li>
                      ))}
                    </ul>
                    <span className="company-badge">{pattern.company}</span>
                  </div>
                  <button 
                    onClick={() => handleStartTest(pattern.id, pattern.name)}
                    className="start-test-btn"
                    disabled={startingTest === pattern.id}
                  >
                    {startingTest === pattern.id ? 'Starting...' : 'Start Test'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {patterns.length === 0 && !loading && (
          <div className="no-patterns">
            <p>No patterns available. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
