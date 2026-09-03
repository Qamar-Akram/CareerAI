import { useEffect, useState } from "react";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  const [appliedJobs, setAppliedJobs] = useState([]);

  // ===============================
  // GET CURRENT USER
  // ===============================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ===============================
  // GET JWT TOKEN
  // ===============================

  const token = localStorage.getItem("token");

  // ===============================
  // LOAD JOBS
  // ===============================

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load jobs.");
        setLoading(false);
      });
  }, []);

  // ===============================
  // LOAD APPLIED JOBS FROM MONGODB
  // JWT PROTECTED REQUEST
  // ===============================

  useEffect(() => {
    if (!user?.id || !token) {
      setAppliedJobs([]);
      return;
    }

    fetch(
      `http://localhost:5000/api/applied-jobs/${user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load applied jobs"
          );
        }

        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAppliedJobs(data);
        } else {
          setAppliedJobs([]);
        }
      })
      .catch((error) => {
        console.error(
          "Applied Jobs Error:",
          error
        );
      });
  }, [user?.id, token]);

  // ===============================
  // SEARCH
  // ===============================

  const filteredJobs = jobs.filter((job) => {
    const keyword = search.toLowerCase();
    const jobLocation = location.toLowerCase();

    const keywordMatch =
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(keyword)
      );

    const locationMatch =
      job.location
        .toLowerCase()
        .includes(jobLocation);

    return keywordMatch && locationMatch;
  });

  // ===============================
  // APPLY JOB
  // JWT PROTECTED REQUEST
  // ===============================

  const handleApply = async (job) => {
    if (!user?.id) {
      alert("Please login first.");
      window.location.hash = "#login";
      return;
    }

    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {
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

    const alreadyApplied = appliedJobs.some(
      (appliedJob) =>
        appliedJob.jobId === job.id
    );

    if (alreadyApplied) {
      return;
    }

    setApplying(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/jobs/${job.id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            // 🔐 JWT TOKEN
            Authorization: `Bearer ${currentToken}`,
          },

          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      // ===============================
      // TOKEN EXPIRED / UNAUTHORIZED
      // ===============================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
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

      // ===============================
      // APPLICATION ERROR
      // ===============================

      if (!response.ok) {
        alert(
          data.message ||
            "Application failed."
        );
        return;
      }

      // ===============================
      // UPDATE APPLIED JOBS
      // ===============================

      setAppliedJobs((previous) => [
        data.appliedJob,
        ...previous,
      ]);

      alert(
        `Successfully applied for ${job.title}!`
      );
    } catch (error) {
      console.error(
        "Apply Error:",
        error
      );

      alert(
        "Cannot connect to backend server."
      );
    } finally {
      setApplying(false);
    }
  };

  // ===============================
  // CHECK APPLIED
  // ===============================

  const isApplied = (jobId) => {
    return appliedJobs.some(
      (job) => job.jobId === jobId
    );
  };

  return (
    <div className="jobs-page">

      <h1>
        Find Your Dream Job
      </h1>

      <p>
        Search for jobs and find the perfect
        opportunity for your career.
      </p>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="job-search">

        <input
          type="text"
          placeholder="Job title or keyword"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        />

        <button>
          🔍 Search Jobs
        </button>

      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <p>
          Loading jobs...
        </p>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <p className="no-jobs">
          {error}
        </p>
      )}

      {/* =========================
          JOB CARDS
      ========================= */}

      {!loading &&
        !error && (
          <div className="jobs-container">

            {filteredJobs.map((job) => (

              <div
                className="job-card"
                key={job.id}
              >

                <h2>
                  {job.title}
                </h2>

                <p>
                  🏢 {job.company}
                </p>

                <p>
                  📍 {job.location}
                </p>

                <div className="skills">

                  {job.skills.map(
                    (skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    )
                  )}

                </div>

                <div className="job-actions">

                  <button
                    className="view-job-btn"
                    onClick={() =>
                      setSelectedJob(job)
                    }
                  >
                    👁️ View Job
                  </button>

                  <button
                    className={
                      isApplied(job.id)
                        ? "applied-btn"
                        : "apply-btn"
                    }
                    onClick={() =>
                      handleApply(job)
                    }
                    disabled={
                      isApplied(job.id) ||
                      applying
                    }
                  >
                    {isApplied(job.id)
                      ? "✅ Applied"
                      : applying
                      ? "Applying..."
                      : "🚀 Apply Now"}
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      {/* =========================
          NO RESULTS
      ========================= */}

      {!loading &&
        !error &&
        filteredJobs.length === 0 && (

          <p className="no-jobs">
            No jobs found. Try another keyword.
          </p>

        )}

      {/* =========================
          JOB DETAILS
      ========================= */}

      {selectedJob && (

        <div className="job-details">

          <h2>
            {selectedJob.title}
          </h2>

          <p>
            <strong>Company:</strong>{" "}
            {selectedJob.company}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {selectedJob.location}
          </p>

          <p>
            <strong>Job Type:</strong>{" "}
            {selectedJob.type}
          </p>

          <p>
            <strong>Salary:</strong>{" "}
            {selectedJob.salary}
          </p>

          <h3>
            Required Skills
          </h3>

          <div className="skills">

            {selectedJob.skills.map(
              (skill) => (
                <span key={skill}>
                  {skill}
                </span>
              )
            )}

          </div>

          <h3>
            Job Description
          </h3>

          <p>
            {selectedJob.description}
          </p>

          <div className="job-details-actions">

            <button
              className={
                isApplied(selectedJob.id)
                  ? "applied-btn"
                  : "apply-btn"
              }
              onClick={() =>
                handleApply(selectedJob)
              }
              disabled={
                isApplied(selectedJob.id) ||
                applying
              }
            >
              {isApplied(selectedJob.id)
                ? "✅ Applied"
                : applying
                ? "Applying..."
                : "🚀 Apply Now"}
            </button>

            <button
              className="close-btn"
              onClick={() =>
                setSelectedJob(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Jobs;

