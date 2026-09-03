import { useEffect, useState } from "react";

function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      setLoggedIn(
        localStorage.getItem("careerAILoggedIn") === "true"
      );
    };

    checkLogin();

    window.addEventListener("hashchange", checkLogin);

    return () => {
      window.removeEventListener("hashchange", checkLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("careerAILoggedIn");
    localStorage.removeItem("careerAIUserName");
    localStorage.removeItem("user");

    window.location.hash = "#login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="#home">CareerAI</a>
      </div>

      <div className="navbar-links">
        <a href="#home">Home</a>
        <a href="#jobs">Jobs</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#resume">Resume</a>
        <a href="#skillgap">Skill Gap</a>
        <a href="#smartjobs">Smart Jobs</a>
        <a href="#about">About</a>
      </div>

      <div className="navbar-auth">
        {loggedIn ? (
          <button onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <a href="#login">Login</a>
            <a href="#register">Register</a>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;