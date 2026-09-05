import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // ================================
        // SAVE JWT TOKEN
        // ================================
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // ================================
        // SAVE USER DATA
        // ================================
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "careerAILoggedIn",
          "true"
        );

        localStorage.setItem(
          "careerAIUserName",
          data.user?.name || "User"
        );

        setMessage("Login successful!");

        // ================================
        // GO TO DASHBOARD
        // ================================
        window.location.hash = "#dashboard";

        window.location.reload();
      } else {
        setError(
          data.message || "Invalid email or password."
        );
      }
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p>
          Login to your CareerAI account
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            name="login-email"
            autoComplete="off"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            name="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {message && (
          <p className="auth-success">
            ✅ {message}
          </p>
        )}

        {error && (
          <p className="auth-error">
            ❌ {error}
          </p>
        )}

        <p className="auth-link">
          Don't have an account?
          <a href="#register"> Register</a>
        </p>

      </div>
    </div>
  );
}

export default Login;