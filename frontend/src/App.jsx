
import { useEffect, useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar.jsx";

import Jobs from "./pages/Jobs.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Resume from "./pages/Resume.jsx";
import SkillGap from "./pages/SkillGap.jsx";
import SmartJobs from "./pages/SmartJobs.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  const [page, setPage] = useState(
    window.location.hash || "#home"
  );

  useEffect(() => {
    const handleHashChange = () => {
      setPage(window.location.hash || "#home");
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);

  const renderPage = () => {
    switch (page) {
      case "#jobs":
        return <Jobs />;

      case "#dashboard":
        return <Dashboard />;

      case "#resume":
        return <Resume />;

      case "#skillgap":
        return <SkillGap />;

      case "#smartjobs":
        return <SmartJobs />;

      case "#about":
        return <About />;

      case "#login":
        return <Login />;

      case "#register":
        return <Register />;

      case "#home":
      default:
        return (
          <div className="home-page">

            {/* HERO SECTION */}
            <section className="hero">

              <div className="hero-content">

                <h1>
                  Build Your Career
                  <br />
                  With <span>CareerAI</span> 🚀
                </h1>

                <p>
                  AI-powered job search, resume analysis,
                  skill gap analysis and smart career
                  recommendations — all in one platform.
                </p>

                <div className="hero-buttons">

                  <a
                    href="#jobs"
                    className="primary-btn"
                  >
                    Explore Jobs
                  </a>

                  <a
                    href="#resume"
                    className="secondary-btn"
                  >
                    Analyze Resume
                  </a>

                </div>

              </div>

              {/* AI SKILL CARD */}
              <div className="hero-card">

                <h3>
                  🤖 AI Career Analysis
                </h3>

                <div className="skill">

                  <div className="skill-header">
                    <span>JavaScript</span>
                    <span>90%</span>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: "90%" }}
                    ></div>
                  </div>

                </div>

                <div className="skill">

                  <div className="skill-header">
                    <span>React</span>
                    <span>80%</span>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: "80%" }}
                    ></div>
                  </div>

                </div>

                <div className="skill">

                  <div className="skill-header">
                    <span>Node.js</span>
                    <span>65%</span>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: "65%" }}
                    ></div>
                  </div>

                </div>

                <div className="skill">

                  <div className="skill-header">
                    <span>TypeScript</span>
                    <span>70%</span>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: "70%" }}
                    ></div>
                  </div>

                </div>

              </div>

            </section>

            {/* FEATURES SECTION */}
            <section className="features">

              <h2>
                Everything You Need For Your Career
              </h2>

              <p className="features-subtitle">
                CareerAI helps you find jobs, improve your
                skills and build a better career.
              </p>

              <div className="feature-container">

                <div className="feature-card">
                  <h3>💼 Smart Jobs</h3>
                  <p>
                    Find suitable jobs based on your
                    skills and career interests.
                  </p>
                </div>

                <div className="feature-card">
                  <h3>📄 Resume Analyzer</h3>
                  <p>
                    Analyze your resume and get an AI
                    powered resume score and suggestions.
                  </p>
                </div>

                <div className="feature-card">
                  <h3>🎯 Skill Gap Analysis</h3>
                  <p>
                    Discover missing skills and get a
                    personalized learning path.
                  </p>
                </div>

              </div>

            </section>

          </div>
        );
    }
  };

  return (
    <>
      <Navbar />

      <main>
        {renderPage()}
      </main>
    </>
  );
}

export default App;

