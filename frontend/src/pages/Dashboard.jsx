import { useEffect, useState } from "react";

function Dashboard() {
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState("");

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [hasResume, setHasResume] = useState(false);

  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);

  // ===============================
  // GET JWT TOKEN
  // ===============================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ===============================
  // LOAD DASHBOARD DATA
  // ===============================

  const loadDashboardData = async () => {
    const savedUser = localStorage.getItem("user");
    const token = getToken();

    if (!savedUser || !token) {
      setUserName(
        localStorage.getItem("careerAIUserName") || "User"
      );

      const savedJobs = localStorage.getItem(
        "careerAIAppliedJobs"
      );

      setAppliedJobs(
        savedJobs ? JSON.parse(savedJobs) : []
      );

      return;
    }

    try {
      const user = JSON.parse(savedUser);

      const id = user.id || user._id || "";

      setUserId(id);
      setUserName(user.name || "User");

      // ===============================
      // APPLIED JOBS FROM MONGODB
      // ===============================

      if (id) {
        setLoadingJobs(true);

        try {
          const response = await fetch(
            `http://localhost:5000/api/applied-jobs/${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();

            if (Array.isArray(data)) {
              setAppliedJobs(data);

              localStorage.setItem(
                "careerAIAppliedJobs",
                JSON.stringify(data)
              );
            } else {
              setAppliedJobs([]);
            }
          } else {
            console.error(
              "Failed to load applied jobs."
            );
          }
        } catch (error) {
          console.error(
            "Applied Jobs Error:",
            error
          );
        } finally {
          setLoadingJobs(false);
        }

        // ===============================
        // RESUME FROM MONGODB
        // ===============================

        setLoadingResume(true);

        try {
          const resumeResponse = await fetch(
            `http://localhost:5000/api/resume/${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (resumeResponse.ok) {
            const resumeData =
              await resumeResponse.json();

            // Resume exists
            setHasResume(
              !!resumeData.resumeText
            );

            // Analysis exists
            if (resumeData.analysis) {
              setResumeAnalysis(
                resumeData.analysis
              );
            } else {
              setResumeAnalysis(null);
            }
          } else if (
            resumeResponse.status === 404
          ) {
            setHasResume(false);
            setResumeAnalysis(null);
          } else {
            console.error(
              "Failed to load resume."
            );

            setHasResume(false);
            setResumeAnalysis(null);
          }
        } catch (error) {
          console.error(
            "Resume Loading Error:",
            error
          );

          setHasResume(false);
          setResumeAnalysis(null);
        } finally {
          setLoadingResume(false);
        }
      }
    } catch (error) {
      console.error(
        "User data error:",
        error
      );
    }
  };

  // ===============================
  // LOAD ON PAGE
  // ===============================

  useEffect(() => {
    loadDashboardData();

    const handleFocus = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    localStorage.removeItem(
      "careerAILoggedIn"
    );

    localStorage.removeItem(
      "careerAIUserName"
    );

    localStorage.removeItem("user");

    // Remove JWT token too
    localStorage.removeItem("token");

    window.location.hash = "#login";
    window.location.reload();
  };

  // ===============================
  // REMOVE APPLIED JOB
  // ===============================

  const removeJob = async (jobId) => {
    if (!userId) {
      alert(
        "User not found. Please login again."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Session expired. Please login again.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("careerAILoggedIn");

      window.location.hash = "#login";
      window.location.reload();

      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/applied-jobs/${userId}/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const updatedJobs =
          appliedJobs.filter(
            (job) => job.jobId !== jobId
          );

        setAppliedJobs(updatedJobs);

        localStorage.setItem(
          "careerAIAppliedJobs",
          JSON.stringify(updatedJobs)
        );

        alert(
          "Job removed successfully!"
        );
      } else {
        alert(
          data.message ||
            "Unable to remove job."
        );
      }
    } catch (error) {
      console.error(
        "Remove Job Error:",
        error
      );

      alert(
        "Cannot connect to backend."
      );
    }
  };

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">

        <div>

          <h1>
            Welcome, {userName}! 👋
          </h1>

          <p>
            Your CareerAI career dashboard
          </p>

        </div>

        <button onClick={handleLogout}>
          Logout
        </button>

      </div>


      {/* =========================
          STATS
      ========================= */}

      <div className="dashboard-stats">

        {/* APPLIED JOBS */}

        <div className="dashboard-card">

          <h3>
            💼 Applied Jobs
          </h3>

          <strong>
            {appliedJobs.length}
          </strong>

          <p>
            Jobs you have applied for
          </p>

        </div>


        {/* RESUME */}

        <div className="dashboard-card">

          <h3>
            📄 Resume
          </h3>

          <strong>
            {loadingResume
              ? "Loading..."
              : hasResume
              ? "Ready"
              : "Not Added"}
          </strong>

          <p>
            Your resume profile
          </p>

        </div>


        {/* SKILLS */}

        <div className="dashboard-card">

          <h3>
            🎯 Skills
          </h3>

          <strong>
            {resumeAnalysis &&
            Array.isArray(
              resumeAnalysis.skills
            )
              ? resumeAnalysis.skills.length
              : 0}
          </strong>

          <p>
            Skills found in resume
          </p>

        </div>


        {/* RESUME SCORE */}

        <div className="dashboard-card">

          <h3>
            🤖 Resume Score
          </h3>

          <strong>
            {resumeAnalysis
              ? `${resumeAnalysis.score}%`
              : "Pending"}
          </strong>

          <p>
            AI resume analysis score
          </p>

        </div>

      </div>


      {/* =========================
          RESUME ANALYSIS
      ========================= */}

      <div className="dashboard-section">

        <h2>
          🤖 AI Resume Analysis
        </h2>

        {loadingResume ? (

          <div className="empty-dashboard">

            <p>
              Loading your resume analysis...
            </p>

          </div>

        ) : !resumeAnalysis ? (

          <div className="empty-dashboard">

            <p>
              You haven't analyzed your
              resume yet.
            </p>

            <a href="#resume">
              Analyze Resume
            </a>

          </div>

        ) : (

          <div className="resume-dashboard-analysis">

            {/* SCORE */}

            <div className="resume-dashboard-card">

              <h3>
                📊 Resume Score
              </h3>

              <div className="dashboard-resume-score">
                {resumeAnalysis.score}%
              </div>

              <p>
                Overall resume strength
              </p>

            </div>


            {/* ROLE */}

            <div className="resume-dashboard-card">

              <h3>
                💼 Recommended Role
              </h3>

              <div className="dashboard-role">
                {
                  resumeAnalysis.recommendedRole ||
                  "Software Developer"
                }
              </div>

              <p>
                Based on your resume skills
              </p>

            </div>


            {/* SKILLS */}

            <div className="resume-dashboard-card">

              <h3>
                🎯 Skills Found
              </h3>

              {Array.isArray(
                resumeAnalysis.skills
              ) &&
              resumeAnalysis.skills.length > 0 ? (

                <div className="dashboard-skills">

                  {resumeAnalysis.skills.map(
                    (skill) => (

                      <span key={skill}>
                        {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p>
                  No technical skills detected.
                </p>

              )}

            </div>


            {/* MISSING SKILLS */}

            <div className="resume-dashboard-card">

              <h3>
                📚 Skills To Improve
              </h3>

              {Array.isArray(
                resumeAnalysis.missingSkills
              ) &&
              resumeAnalysis.missingSkills
                .length > 0 ? (

                <div className="dashboard-missing-skills">

                  {resumeAnalysis.missingSkills
                    .slice(0, 6)
                    .map((skill) => (

                      <span key={skill}>
                        {skill}
                      </span>

                    ))}

                </div>

              ) : (

                <p>
                  🎉 No major missing skills!
                </p>

              )}

            </div>


            {/* SUGGESTIONS */}

            {Array.isArray(
              resumeAnalysis.suggestions
            ) &&
            resumeAnalysis.suggestions.length >
              0 && (

              <div className="resume-dashboard-card">

                <h3>
                  📚 AI Suggestions
                </h3>

                <ul>

                  {resumeAnalysis.suggestions
                    .slice(0, 5)
                    .map(
                      (suggestion, index) => (

                        <li key={index}>
                          {suggestion}
                        </li>

                      )
                    )}

                </ul>

              </div>

            )}


            {/* UPDATE */}

            <div className="dashboard-analysis-action">

              <a href="#resume">
                🔄 Update Resume Analysis
              </a>

            </div>

          </div>

        )}

      </div>


      {/* =========================
          APPLIED JOBS
      ========================= */}

      <div className="dashboard-section">

        <h2>
          💼 My Applied Jobs
        </h2>

        {loadingJobs ? (

          <div className="empty-dashboard">

            <p>
              Loading your applied jobs...
            </p>

          </div>

        ) : appliedJobs.length === 0 ? (

          <div className="empty-dashboard">

            <p>
              You haven't applied for
              any jobs yet.
            </p>

            <a href="#jobs">
              Browse Jobs
            </a>

          </div>

        ) : (

          <div className="applied-jobs">

            {appliedJobs.map((job) => (

              <div
                className="applied-job-card"
                key={
                  job._id ||
                  `${job.userId}-${job.jobId}`
                }
              >

                <h3>
                  {job.title}
                </h3>

                <p>
                  🏢 {job.company}
                </p>

                <p>
                  📍 {job.location}
                </p>

                <p>
                  💼 {job.type || "Full Time"}
                </p>

                <p>
                  💰{" "}
                  {job.salary ||
                    "Not specified"}
                </p>

                <span className="applied-status">
                  ✅ Applied
                </span>

                <button
                  className="remove-job-btn"
                  onClick={() =>
                    removeJob(job.jobId)
                  }
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;

