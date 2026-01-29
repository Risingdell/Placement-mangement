import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <h2>Student Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <button type="submit" style={{ width: '100%', padding: '10px', margin: '10px 0', cursor: 'pointer' }}>
          Login
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
