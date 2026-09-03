function About() {
  return (
    <div className="about-page">
      <div className="about-container">

        {/* Header */}
        <div className="about-header">
          <h1>🚀 About CareerAI</h1>

          <p>
            CareerAI is an AI-powered career and job platform designed to
            help students and job seekers find the right career path.
          </p>
        </div>

        {/* Cards */}
        <div className="about-grid">

          <div className="about-card">
            <h2>🎯 Our Mission</h2>
            <p>
              Our mission is to help users understand their skills, identify
              skill gaps, analyze resumes, and discover suitable job
              opportunities.
            </p>
          </div>

          <div className="about-card">
            <h2>🤖 AI Career Analysis</h2>
            <p>
              CareerAI analyzes resume information and skills to provide
              career suggestions, recommended roles, and personalized job
              matching.
            </p>
          </div>

          <div className="about-card">
            <h2>💼 Job Opportunities</h2>
            <p>
              Users can search for jobs, check job requirements, find
              matching opportunities, and apply for suitable positions.
            </p>
          </div>

          <div className="about-card">
            <h2>📚 Skill Development</h2>
            <p>
              The Skill Gap feature helps users discover missing skills and
              understand what they need to learn for their desired career.
            </p>
          </div>

        </div>

        {/* Technologies */}
        <div className="about-technologies">
          <h2>🛠️ Technologies Used</h2>

          <div className="tech-list">
            <span>React</span>
            <span>JavaScript</span>
            <span>Node.js</span>
            <span>Express</span>
            <span>MongoDB</span>
            <span>CSS</span>
          </div>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <h2>🌟 CareerAI</h2>
          <p>
            Build your skills. Improve your resume. Find your career.
          </p>
        </div>

      </div>
    </div>
  );
}

export default About;