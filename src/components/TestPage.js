import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TestPage.css";
import Navbar from "./Navbar";

function TestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    patternId, 
    attemptId: passedAttemptId,
    company,
    testName, 
    timeLimitSeconds,
    questions: passedQuestions 
  } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(passedAttemptId);
  const [testStarted, setTestStarted] = useState(false);

  // Start the test with pattern data from Dashboard
  const startTest = useCallback(async () => {
    // If questions are already passed from Dashboard, use them directly
    if (passedQuestions && passedQuestions.length > 0) {
      setQuestions(passedQuestions);
      setTimeLeft(timeLimitSeconds || 30 * 60);
      setLoading(false);
      setTestStarted(true);
      return;
    }

    // Fallback: fetch from API if needed
    if (!patternId) return;
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBase}/api/patterns/${patternId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start test');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      setTimeLeft(data.timeLimitSeconds || 30 * 60);
      setLoading(false);
      setTestStarted(true);
    } catch (error) {
      console.error('Error starting test:', error);
      setTimeLeft(30 * 60);
      setLoading(false);
      setTestStarted(true);
    }
  }, [patternId, passedQuestions, timeLimitSeconds]);

  useEffect(() => {
    if (!testStarted) {
      startTest();
    }
  }, [testStarted, startTest]);

  // Timer
  const handleSubmit = useCallback(async () => {
    try {
      if (attemptId) {
        // Convert selectedAnswers to responses format: [{ questionId, selected }]
        const responses = Object.entries(selectedAnswers).map(([qid, selected]) => ({
          questionId: qid,
          selected: selected
        }));

        console.log('Submitting responses:', responses);

        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const submitResponse = await fetch(`${apiBase}/api/attempts/${attemptId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responses: responses,
          }),
        });

        if (!submitResponse.ok) {
          console.error('Submit failed:', submitResponse.status);
        }

        const submitData = await submitResponse.json();
        console.log('Submit response:', submitData);

        navigate("/result", {
          state: { 
            score: submitData.score, 
            correct: submitData.correct,
            total: submitData.total, 
            testName: testName || "Test",
            attemptId: attemptId,
            company: company
          },
        });
      } else {
        // Fallback if no attemptId
        const correctCount = questions.filter(
          (q) => selectedAnswers[q.id] === q.correctAnswer
        ).length;

        navigate("/result", {
          state: { score: Math.round((correctCount / questions.length) * 100), total: questions.length, testName: testName || "Test" },
        });
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      // Still navigate to results even if submission fails
      navigate("/result", {
        state: { score: 0, total: questions.length, testName: testName || "Test" },
      });
    }
  }, [attemptId, selectedAnswers, questions, navigate, testName, company]);

  useEffect(() => {
    if (timeLeft === null || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const handleSelect = (qid, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qid]: option });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // handleSubmit is defined above with useCallback

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="test-container">
          <div className="loading">Loading test questions...</div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="test-container">
          <div className="error">No questions available for this test.</div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div>
      <Navbar />
      <div className="test-container">
        <div className="test-header">
          <h2>{testName || "Practice Test"}</h2>
          <div className="test-info">
            <span className="question-counter">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="timer">
              ⏱ Time Left: {timeLeft ? formatTime(timeLeft) : '00:00'}
            </span>
          </div>
        </div>

        <div className="question-card">
          <div className="question-header">
            {q.company && <span className="question-company">{q.company}</span>}
            <span className="question-category">{q.category}</span>
            <span className="question-difficulty">{q.difficulty}</span>
          </div>
          <h3 className="question-text">
            Q{currentQuestion + 1}. {q.text}
          </h3>
          <div className="options">
            {q.choices && q.choices.map((opt, index) => (
              <label key={index} className="option">
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={opt}
                  checked={selectedAnswers[q.id] === opt}
                  onChange={() => handleSelect(q.id, opt)}
                />
                <span className="option-text">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="nav-buttons">
          <button 
            onClick={handlePrev} 
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          <span className="question-status">
            {selectedAnswers[q.id] ? '✓ Answered' : 'Not answered'}
          </span>
          
          {currentQuestion < questions.length - 1 ? (
            <button onClick={handleNext} className="nav-btn next-btn">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} className="nav-btn submit-btn">
              Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestPage;
