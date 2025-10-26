import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "./Login.css";

const ADMIN_EMAIL = "teppichart113@gmail.com"; // ✅ match exactly with Firebase

const Login = () => {
  const navigate = useNavigate();

  // ✅ Load saved email if available
  const savedEmail = localStorage.getItem("adminEmail") || "";

  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await signInWithEmailAndPassword(auth, email, password);

      if (user.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        // ✅ Save email for next time
        localStorage.setItem("adminEmail", email);
        navigate("/admin");
      } else {
        setError("Access denied — not authorized as admin.");
      }
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="loginContainer">
      <form onSubmit={handleSubmit} className="loginBox">
        <h2>Admin Login</h2>
        <p>Access Teppich Art Dashboard</p>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
