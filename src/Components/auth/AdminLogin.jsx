import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
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
      const userData = await login({ email, password });

      // Check if user is admin or TPO
      if (userData.user.role !== 'admin' && userData.user.role !== 'tpo') {
        setError("Access denied. Admin credentials required.");
        setIsLoading(false);
        return;
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="neo-page-container">
      <div className="max-w-md w-full relative">
        {/* Back Button */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center neo-subtitle hover:underline"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Login Card */}
        <div className="neo-form">
          {/* Header */}
          <div className="text-center mb-4">
            <p className="neo-title">
              ADMIN<span>PORTAL LOGIN</span>
            </p>
            <div className="neo-subtitle mt-2">Sign in to manage the placement system</div>
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
                Admin Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@college.edu"
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
                  Sign in to Admin Panel
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
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 border-2 border-[#323232] rounded bg-purple-50">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-purple-900 font-mono">
                <p className="font-bold mb-1">Admin Access Only</p>
                <p className="text-[12px]">Restricted to authorized administrators and TPO staff. Unauthorized access is logged.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 neo-subtitle">
          Not an admin? <Link to="/" className="font-bold underline text-purple-600">Return to home</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
