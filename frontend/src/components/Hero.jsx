function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Build Your Career With <span>AI</span>
        </h1>

        <p>
          Find the right jobs, improve your resume, discover missing skills,
          and get personalized career guidance with artificial intelligence.
        </p>

        <div className="hero-buttons">
          <a href="#jobs" className="primary-btn">
            Find Jobs
          </a>

          <a href="#resume" className="secondary-btn">
            Analyze My Resume
          </a>
        </div>
      </div>

      <div className="hero-card">
        <h3>AI Career Analysis</h3>

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
      </div>
    </section>
  );
}

export default Hero;