import { useState } from "react";

function SkillGap() {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const jobSkills = {
    "Frontend Developer": [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Git",
      "TypeScript",
      "Next.js",
    ],

    "Backend Developer": [
      "Node.js",
      "Express",
      "MongoDB",
      "SQL",
      "Git",
      "REST API",
      "Authentication",
    ],

    "Full Stack Developer": [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "Git",
    ],

    "AI / ML Developer": [
      "Python",
      "NumPy",
      "Pandas",
      "Machine Learning",
      "Deep Learning",
      "SQL",
      "Git",
    ],
  };

  // ================================
  // ANALYZE SKILLS
  // ================================
  const analyzeSkills = () => {
    if (!role) {
      alert("Please select a target job role.");
      return;
    }

    if (!skills.trim()) {
      alert("Please enter your current skills.");
      return;
    }

    const userSkills = skills
      .toLowerCase()
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    const requiredSkills = jobSkills[role];

    const yourSkills = requiredSkills.filter((skill) =>
      userSkills.includes(skill.toLowerCase())
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !userSkills.includes(skill.toLowerCase())
    );

    const percentage = Math.round(
      (yourSkills.length / requiredSkills.length) * 100
    );

    const newResult = {
      role,
      yourSkills,
      missingSkills,
      percentage,
    };

    setResult(newResult);
    setSaved(false);
  };

  // ================================
  // SAVE ANALYSIS
  // ================================
  const saveAnalysis = () => {
    if (!result) {
      alert("Please analyze your skills first.");
      return;
    }

    const analysisData = {
      role,
      skills,
      result,
    };

    localStorage.setItem(
      "skillGapAnalysis",
      JSON.stringify(analysisData)
    );

    setSaved(true);

    alert("Skill analysis saved successfully! ✅");
  };

  // ================================
  // LOAD ANALYSIS
  // ================================
  const loadAnalysis = () => {
    const savedData = localStorage.getItem("skillGapAnalysis");

    if (!savedData) {
      alert("No saved skill analysis found.");
      return;
    }

    try {
      const data = JSON.parse(savedData);

      setRole(data.role || "");
      setSkills(data.skills || "");
      setResult(data.result || null);
      setSaved(true);

      alert("Saved skill analysis loaded successfully! ✅");
    } catch (error) {
      console.error("Error loading skill analysis:", error);
      alert("Saved analysis data is corrupted.");
    }
  };

  // ================================
  // CLEAR SCREEN
  // IMPORTANT:
  // Do NOT remove localStorage here.
  // ================================
  const clearAnalysis = () => {
    setRole("");
    setSkills("");
    setResult(null);
    setSaved(false);
  };

  return (
    <div className="skillgap-page">
      <div className="skillgap-container">

        {/* ================================
            HEADER
        ================================= */}
        <h1>🎯 Skill Gap Analysis</h1>

        <p className="skillgap-subtitle">
          Discover which skills you need for your dream job.
        </p>

        {/* ================================
            FORM
        ================================= */}
        <div className="skillgap-form">

          <label>Target Job Role</label>

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setSaved(false);
            }}
          >
            <option value="">Select Job Role</option>

            <option value="Frontend Developer">
              Frontend Developer
            </option>

            <option value="Backend Developer">
              Backend Developer
            </option>

            <option value="Full Stack Developer">
              Full Stack Developer
            </option>

            <option value="AI / ML Developer">
              AI / ML Developer
            </option>
          </select>

          <label>Your Current Skills</label>

          <textarea
            placeholder="Example: HTML, CSS, JavaScript, React, Git"
            value={skills}
            onChange={(e) => {
              setSkills(e.target.value);
              setSaved(false);
            }}
          />

          {/* ANALYZE BUTTON */}
          <button
            className="skillgap-btn"
            onClick={analyzeSkills}
          >
            🔍 Analyze Skill Gap
          </button>

          {/* ================================
              SAVE / LOAD / CLEAR BUTTONS
          ================================= */}
          <div className="skillgap-buttons">

            <button
              className="skillgap-save-btn"
              onClick={saveAnalysis}
            >
              💾 Save Analysis
            </button>

            <button
              className="skillgap-load-btn"
              onClick={loadAnalysis}
            >
              📂 Load Analysis
            </button>

            <button
              className="skillgap-clear-btn"
              onClick={clearAnalysis}
            >
              🗑️ Clear
            </button>

          </div>

          {/* SAVED MESSAGE */}
          {saved && (
            <p className="skillgap-saved">
              ✅ Skill analysis saved successfully!
            </p>
          )}

        </div>

        {/* ================================
            RESULT
        ================================= */}
        {result && (
          <div className="skillgap-result">

            {/* ================================
                SKILL MATCH
            ================================= */}
            <div className="skillgap-score">

              <h2>📊 Skill Match</h2>

              <div className="skillgap-percentage">
                {result.percentage}%
              </div>

              <p>
                You match {result.percentage}% of the required skills.
              </p>

            </div>

            {/* ================================
                TARGET ROLE
            ================================= */}
            <div className="skillgap-section">

              <h2>💼 Target Role</h2>

              <div className="skillgap-role">
                {result.role}
              </div>

            </div>

            {/* ================================
                YOUR SKILLS
            ================================= */}
            <div className="skillgap-section">

              <h2>✅ Your Skills</h2>

              <div className="skillgap-tags">

                {result.yourSkills.length > 0 ? (
                  result.yourSkills.map((skill) => (
                    <span
                      className="skill-found"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No matching skills found.</p>
                )}

              </div>

            </div>

            {/* ================================
                MISSING SKILLS
            ================================= */}
            <div className="skillgap-section">

              <h2>❌ Missing Skills</h2>

              <div className="skillgap-tags">

                {result.missingSkills.length > 0 ? (
                  result.missingSkills.map((skill) => (
                    <span
                      className="skill-missing"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>
                    🎉 You have all required skills!
                  </p>
                )}

              </div>

            </div>

            {/* ================================
                LEARNING PATH
            ================================= */}
            <div className="skillgap-section">

              <h2>📚 Recommended Learning Path</h2>

              {result.missingSkills.length > 0 ? (
                <ol>
                  {result.missingSkills.map((skill) => (
                    <li key={skill}>
                      Learn <strong>{skill}</strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>
                  You are ready for this job role! 🚀
                </p>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default SkillGap;