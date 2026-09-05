import { useEffect, useState } from "react";

function Resume() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===============================
  // GET LOGGED-IN USER
  // ===============================

  const getUser = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  };

  // ===============================
  // GET JWT TOKEN
  // ===============================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ===============================
  // LOAD RESUME AUTOMATICALLY
  // ===============================

  useEffect(() => {
    const loadResumeFromDatabase = async () => {
      const user = getUser();
      const token = getToken();

      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/resume/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 404) {
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load resume."
          );
        }

        setResumeText(data.resumeText || "");
        setAnalysis(data.analysis || null);
        setSaved(true);
      } catch (error) {
        console.error("Load Resume Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResumeFromDatabase();
  }, []);

  // ===============================
  // ANALYZE RESUME
  // ===============================

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert("Please enter your resume information first.");
      return;
    }

    const user = getUser();
    const token = getToken();

    if (!user || !token) {
      alert("Please login first.");
      window.location.hash = "#login";
      return;
    }

    const text = resumeText.toLowerCase();

    const allSkills = [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "Python",
      "Git",
      "SQL",
      "TypeScript",
      "Next.js",
    ];

    const skills = [];

    allSkills.forEach((skill) => {
      if (text.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });

    const missingSkills = allSkills.filter(
      (skill) => !skills.includes(skill)
    );

    const suggestions = [];

    if (!text.includes("github")) {
      suggestions.push(
        "Add your GitHub profile or projects."
      );
    }

    if (!text.includes("project")) {
      suggestions.push(
        "Add 2-3 real projects to your resume."
      );
    }

    if (
      !text.includes("experience") &&
      !text.includes("internship")
    ) {
      suggestions.push(
        "Add your internship or work experience."
      );
    }

    if (
      !text.includes("education") &&
      !text.includes("bscs")
    ) {
      suggestions.push(
        "Add your education details."
      );
    }

    if (
      !text.includes("summary") &&
      !text.includes("objective")
    ) {
      suggestions.push(
        "Add a short professional summary."
      );
    }

    // ===============================
    // RECOMMENDED ROLE
    // ===============================

    let recommendedRole = "Software Developer";

    if (
      text.includes("react") ||
      text.includes("html") ||
      text.includes("css")
    ) {
      recommendedRole = "Frontend Developer";
    }

    if (
      text.includes("node") ||
      text.includes("express") ||
      text.includes("mongodb")
    ) {
      recommendedRole = "Backend Developer";
    }

    if (
      text.includes("react") &&
      text.includes("node") &&
      text.includes("mongodb")
    ) {
      recommendedRole = "Full Stack Developer";
    }

    if (
      text.includes("python") &&
      (text.includes("machine learning") ||
        text.includes("ai"))
    ) {
      recommendedRole = "AI / ML Developer";
    }

    // ===============================
    // RESUME SCORE
    // ===============================

    let score = 40;

    score += Math.min(skills.length * 4, 32);

    if (text.includes("project")) {
      score += 8;
    }

    if (text.includes("github")) {
      score += 5;
    }

    if (
      text.includes("experience") ||
      text.includes("internship")
    ) {
      score += 7;
    }

    score = Math.min(score, 100);

    const result = {
      score,
      skills,
      missingSkills,
      suggestions,
      recommendedRole,
    };

    // Show analysis
    setAnalysis(result);

    // ===============================
    // SAVE ANALYSIS TO MONGODB
    // ===============================

    try {
      const response = await fetch(
        "/api/resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            resumeText,
            analysis: result,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save resume."
        );
      }

      setSaved(true);

      alert(
        "Resume analyzed and saved to MongoDB successfully!"
      );
    } catch (error) {
      console.error(
        "Save Analysis Error:",
        error
      );

      alert(
        "Analysis completed, but resume could not be saved."
      );
    }
  };

  // ===============================
  // SAVE RESUME
  // ===============================

  const saveResume = async () => {
    if (!resumeText.trim()) {
      alert(
        "Please enter your resume information first."
      );
      return;
    }

    const user = getUser();
    const token = getToken();

    if (!user || !token) {
      alert("Please login first.");
      window.location.hash = "#login";
      return;
    }

    try {
      const response = await fetch(
        "/api/resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            resumeText,
            analysis,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save resume."
        );
      }

      setSaved(true);

      alert("Resume saved successfully!");
    } catch (error) {
      console.error(
        "Save Resume Error:",
        error
      );

      alert(
        "Server error while saving resume."
      );
    }
  };

  // ===============================
  // LOAD RESUME
  // ===============================

  const loadResume = async () => {
    const user = getUser();
    const token = getToken();

    if (!user || !token) {
      alert("Please login first.");
      window.location.hash = "#login";
      return;
    }

    try {
      const response = await fetch(
        `/api/resume/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "No saved resume found."
        );
        return;
      }

      setResumeText(data.resumeText || "");
      setAnalysis(data.analysis || null);
      setSaved(true);

      alert("Resume loaded successfully!");
    } catch (error) {
      console.error(
        "Load Resume Error:",
        error
      );

      alert(
        "Server error while loading resume."
      );
    }
  };

  // ===============================
  // CLEAR RESUME
  // IMPORTANT:
  // ONLY CLEAR SCREEN
  // DO NOT DELETE FROM MONGODB
  // ===============================

  const clearResume = () => {
    setResumeText("");
    setAnalysis(null);
    setSaved(false);

    alert("Resume cleared from screen!");
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div className="resume-page">
      <div className="resume-container">

        <h1>🤖 AI Resume Analyzer</h1>

        <p className="resume-subtitle">
          Analyze your resume and discover ways to
          improve it.
        </p>

        {loading ? (
          <p>⏳ Loading your resume...</p>
        ) : (
          <>
            <textarea
              placeholder={`Paste your resume information here...

Example:
BS Computer Science

Skills:
HTML, CSS, JavaScript, React, Node.js, MongoDB, Git

Projects:
CareerAI Job Platform

Education:
BS Computer Science

GitHub:
github.com/myprofile`}
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setSaved(false);
              }}
            />

            <div className="resume-buttons">

              <button
                className="analyze-btn"
                onClick={analyzeResume}
              >
                🔍 Analyze My Resume
              </button>

              <button
                className="save-btn"
                onClick={saveResume}
              >
                💾 Save Resume
              </button>

              <button
                className="load-btn"
                onClick={loadResume}
              >
                📂 Load Resume
              </button>

              <button
                className="clear-btn"
                onClick={clearResume}
              >
                🗑️ Clear
              </button>

            </div>

            {saved && (
              <p className="saved-message">
                ✅ Resume saved successfully!
              </p>
            )}

            {analysis && (
              <div className="analysis-result">

                {/* SCORE */}

                <div className="score-card">

                  <h2>📊 Resume Score</h2>

                  <div className="score">
                    {analysis.score}%
                  </div>

                  <p>
                    Your resume has been analyzed
                    successfully.
                  </p>

                </div>

                {/* RECOMMENDED ROLE */}

                <div className="analysis-section">

                  <h2>
                    💼 Recommended Job Role
                  </h2>

                  <div className="recommended-role">
                    {analysis.recommendedRole}
                  </div>

                </div>

                {/* SKILLS FOUND */}

                <div className="analysis-section">

                  <h2>🎯 Skills Found</h2>

                  {analysis.skills &&
                  analysis.skills.length > 0 ? (
                    <div className="resume-skills">

                      {analysis.skills.map(
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

                <div className="analysis-section">

                  <h2>❌ Missing Skills</h2>

                  {analysis.missingSkills &&
                  analysis.missingSkills.length > 0 ? (
                    <div className="resume-skills">

                      {analysis.missingSkills.map(
                        (skill) => (
                          <span key={skill}>
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p>
                      🎉 Great! No major skills
                      are missing.
                    </p>
                  )}

                </div>

                {/* SUGGESTIONS */}

                <div className="analysis-section">

                  <h2>📚 Suggestions</h2>

                  {analysis.suggestions &&
                  analysis.suggestions.length > 0 ? (
                    <ul>

                      {analysis.suggestions.map(
                        (suggestion, index) => (
                          <li key={index}>
                            {suggestion}
                          </li>
                        )
                      )}

                    </ul>
                  ) : (
                    <p>
                      🎉 Your resume looks
                      excellent!
                    </p>
                  )}

                </div>

              </div>
            )}

          </>
        )}

      </div>
    </div>
  );
}

export default Resume;

