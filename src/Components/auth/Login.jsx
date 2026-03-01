import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="neo-page-container">
      <div className="max-w-md w-full relative">
        {/* Login Card */}
        <div className="neo-form">
          {/* Header */}
          <div className="text-center mb-4">
            <p className="neo-title">
              STUDENT<span>PORTAL LOGIN</span>
            </p>
            <div className="neo-subtitle mt-2">Sign in to access your placement portal</div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="neo-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email Input */}
            <div className="flex flex-col gap-4">
              <label htmlFor="email" className="neo-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neo-input"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-4">
              <label htmlFor="password" className="neo-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="neo-button mt-4"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg className="neo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="neo-subtitle hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="neo-separator">
              <div></div>
              <span>OR</span>
              <div></div>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="neo-button bg-[#f0f0f0]"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 neo-subtitle">
          Need help? <a href="mailto:support@placement.edu" className="font-bold underline">Contact support</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
