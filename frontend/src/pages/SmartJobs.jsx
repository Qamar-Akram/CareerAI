import { useEffect, useState } from "react";

function SmartJobs() {
  const [skills, setSkills] = useState("");
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);

  // ===============================
  // GET CURRENT USER
  // ===============================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ===============================
  // LOAD JOBS FROM BACKEND
  // ===============================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/jobs"
        );

        if (!response.ok) {
          throw new Error("Failed to load jobs.");
        }

        const data = await response.json();

        setAllJobs(data);
        setJobs(data);
        setError("");
      } catch (error) {
        console.error(
          "Smart Jobs Error:",
          error
        );

        setError(
          "Unable to load jobs from server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ===============================
  // LOAD APPLIED JOBS FROM MONGODB
  // JWT PROTECTED
  // ===============================

  useEffect(() => {
    const loadAppliedJobs = async () => {
      const storedUser =
        localStorage.getItem("user");

      const token =
        localStorage.getItem("token");

      if (!storedUser || !token) {
        setAppliedJobs([]);
        return;
      }

      try {
        const currentUser =
          JSON.parse(storedUser);

        const userId =
          currentUser.id ||
          currentUser._id;

        if (!userId) {
          return;
        }

        const response = await fetch(
          `/api/applied-jobs/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          console.error(
            "JWT expired or unauthorized."
          );

          setAppliedJobs([]);
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load applied jobs."
          );
        }

        if (Array.isArray(data)) {
          setAppliedJobs(data);
        } else {
          setAppliedJobs([]);
        }
      } catch (error) {
        console.error(
          "Applied Jobs Error:",
          error
        );
      }
    };

    loadAppliedJobs();
  }, []);

  // ===============================
  // FIND MATCHING JOBS
  // ===============================

  const findJobs = () => {
    if (!skills.trim()) {
      alert(
        "Please enter your skills first."
      );
      return;
    }

    const userSkills = skills
      .toLowerCase()
      .split(",")
      .map((skill) => skill.trim())
      .filter(
        (skill) => skill !== ""
      );

    const results = allJobs
      .map((job) => {
        const matchedSkills =
          job.skills.filter((skill) =>
            userSkills.includes(
              skill.toLowerCase()
            )
          );

        const missingSkills =
          job.skills.filter(
            (skill) =>
              !userSkills.includes(
                skill.toLowerCase()
              )
          );

        const matchPercentage =
          job.skills.length > 0
            ? Math.round(
                (matchedSkills.length /
                  job.skills.length) *
                  100
              )
            : 0;

        const alreadyApplied =
          appliedJobs.some(
            (appliedJob) =>
              appliedJob.jobId === job.id
          );

        return {
          ...job,
          matchedSkills,
          missingSkills,
          matchPercentage,
          applied: alreadyApplied,
        };
      })
      .sort(
        (a, b) =>
          b.matchPercentage -
          a.matchPercentage
      );

    setJobs(results);
  };

  // ===============================
  // APPLY FOR JOB
  // JWT PROTECTED
  // ===============================

  const handleApply = async (job) => {
    const storedUser =
      localStorage.getItem("user");

    const token =
      localStorage.getItem("token");

    // ===============================
    // LOGIN CHECK
    // ===============================

    if (!storedUser) {
      alert("Please login first.");
      window.location.hash = "#login";
      return;
    }

    // ===============================
    // JWT CHECK
    // ===============================

    if (!token) {
      alert(
        "Your session has expired. Please login again."
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem(
        "careerAILoggedIn"
      );

      window.location.hash = "#login";
      return;
    }

    try {
      const currentUser =
        JSON.parse(storedUser);

      const userId =
        currentUser.id ||
        currentUser._id;

      if (!userId) {
        alert(
          "User information not found. Please login again."
        );
        return;
      }

      // ===============================
      // ALREADY APPLIED CHECK
      // ===============================

      const alreadyApplied =
        appliedJobs.some(
          (appliedJob) =>
            appliedJob.jobId === job.id
        );

      if (alreadyApplied || job.applied) {
        return;
      }

      setApplyingJobId(job.id);

      // ===============================
      // APPLY REQUEST
      // ===============================

      const response = await fetch(
        `/api/jobs/${job.id}/apply`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            // 🔐 JWT TOKEN
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            userId: userId,
          }),
        }
      );

      const data =
        await response.json();

      // ===============================
      // UNAUTHORIZED
      // ===============================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        alert(
          "Your session has expired. Please login again."
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "careerAILoggedIn"
        );

        window.location.hash = "#login";
        return;
      }

      // ===============================
      // APPLICATION ERROR
      // ===============================

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to apply for this job."
        );
        return;
      }

      // ===============================
      // SAVE APPLIED JOB
      // ===============================

      if (data.appliedJob) {
        setAppliedJobs(
          (previous) => [
            data.appliedJob,
            ...previous,
          ]
        );
      }

      // ===============================
      // UPDATE BUTTON
      // ===============================

      setJobs(
        (currentJobs) =>
          currentJobs.map(
            (item) =>
              item.id === job.id
                ? {
                    ...item,
                    applied: true,
                  }
                : item
          )
      );

      alert(
        `Successfully applied for ${job.title}!`
      );
    } catch (error) {
      console.error(
        "Apply Error:",
        error
      );

      alert(
        "Server error while applying for job."
      );
    } finally {
      setApplyingJobId(null);
    }
  };

  // ===============================
  // CLEAR RESULTS
  // ===============================

  const clearResults = () => {
    setSkills("");
    setJobs([]);
  };

  // ===============================
  // CHECK APPLIED
  // ===============================

  const isApplied = (job) => {
    return (
      job.applied ||
      appliedJobs.some(
        (appliedJob) =>
          appliedJob.jobId === job.id
      )
    );
  };

  return (
    <div className="smartjobs-page">

      <div className="smartjobs-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="smartjobs-header">

          <h1>
            🤖 Smart Job Matching
          </h1>

          <p className="smartjobs-subtitle">
            Enter your skills and let
            CareerAI find the jobs that
            best match your profile.
          </p>

        </div>

        {/* =========================
            INPUT SECTION
        ========================= */}

        <div className="smartjobs-search-box">

          <label>
            Your Skills
          </label>

          <textarea
            placeholder="Example: React, JavaScript, HTML, CSS, Node.js, MongoDB"
            value={skills}
            onChange={(e) =>
              setSkills(e.target.value)
            }
          />

          <div className="smartjobs-actions">

            <button
              className="smartjobs-btn"
              onClick={findJobs}
              disabled={loading}
            >
              🔍 Find Matching Jobs
            </button>

            {jobs.length > 0 && (
              <button
                className="smartjobs-clear-btn"
                onClick={clearResults}
              >
                Clear
              </button>
            )}

          </div>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="smartjobs-message">

            <h3>
              ⏳ Loading jobs...
            </h3>

            <p>
              Please wait while CareerAI
              loads available jobs.
            </p>

          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {error && !loading && (
          <div className="smartjobs-message">

            <h3>
              ❌ {error}
            </h3>

            <p>
              Make sure your backend
              server is running on
              port 5000.
            </p>

          </div>
        )}

        {/* =========================
            RESULTS
        ========================= */}

        {!loading &&
          !error &&
          jobs.length > 0 && (

            <div className="smartjobs-results">

              <div className="results-header">

                <h2>
                  🎯 Recommended Jobs
                </h2>

                <span>
                  {jobs.length} Jobs Found
                </span>

              </div>

              {jobs.map((job) => (

                <div
                  className="job-match-card"
                  key={job.id}
                >

                  {/* =====================
                      JOB INFORMATION
                  ===================== */}

                  <div className="job-info">

                    <div className="job-title-row">

                      <h3>
                        {job.title}
                      </h3>

                      {job.matchPercentage >=
                        70 && (
                        <span className="best-match">
                          ⭐ Best Match
                        </span>
                      )}

                    </div>

                    <p>
                      🏢 {job.company}
                    </p>

                    <p>
                      📍 {job.location}
                    </p>

                    <p>
                      💼 {job.type}
                    </p>

                    <p>
                      💰 {job.salary}
                    </p>

                    <p className="job-description">
                      {job.description}
                    </p>

                    {/* =====================
                        ALL SKILLS
                    ===================== */}

                    <div className="job-skills">

                      <strong>
                        Required Skills:
                      </strong>

                      <div className="skills-list">

                        {job.skills.map(
                          (skill) => (
                            <span
                              key={skill}
                            >
                              {skill}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                    {/* =====================
                        MATCHED SKILLS
                    ===================== */}

                    {job.matchedSkills &&
                      job.matchedSkills
                        .length > 0 && (

                        <div className="matched-skills">

                          <strong>
                            ✅ Your Matching
                            Skills:
                          </strong>

                          <div className="skills-list">

                            {job.matchedSkills.map(
                              (skill) => (
                                <span
                                  key={skill}
                                >
                                  {skill}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    {/* =====================
                        MISSING SKILLS
                    ===================== */}

                    {job.missingSkills &&
                      job.missingSkills
                        .length > 0 && (

                        <div className="missing-skills">

                          <strong>
                            ⚠️ Skills to
                            Improve:
                          </strong>

                          <div className="skills-list">

                            {job.missingSkills.map(
                              (skill) => (
                                <span
                                  key={skill}
                                >
                                  {skill}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    {/* =====================
                        APPLY BUTTON
                    ===================== */}

                    <button
                      className="smart-apply-btn"
                      onClick={() =>
                        handleApply(job)
                      }
                      disabled={
                        isApplied(job) ||
                        applyingJobId ===
                          job.id
                      }
                    >
                      {isApplied(job)
                        ? "✓ Applied"
                        : applyingJobId ===
                          job.id
                        ? "Applying..."
                        : "Apply Now"}
                    </button>

                  </div>

                  {/* =====================
                      MATCH SCORE
                  ===================== */}

                  <div className="match-score">

                    <div className="match-circle">

                      <strong>
                        {job.matchPercentage}%
                      </strong>

                      <small>
                        Match
                      </small>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!loading &&
          !error &&
          jobs.length === 0 && (

            <div className="smartjobs-message">

              <h3>
                🎯 Find Your Perfect Job
              </h3>

              <p>
                Enter your skills above
                and CareerAI will calculate
                your job compatibility.
              </p>

            </div>
          )}

      </div>

    </div>
  );
}

export default SmartJobs;

