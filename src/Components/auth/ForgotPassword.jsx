import { useState } from "react";
import authService from "../../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email is required");
      return;
    }

    try {
      await authService.forgotPassword(email);
      alert("Password reset link sent to email");
    } catch (err) {
      alert("Error sending reset link");
    }
  };

  return (
    <div className="neo-page-container">
      <div className="max-w-md w-full relative">
        <div className="neo-form">
          <div className="text-center mb-4">
            <p className="neo-title">
              FORGOT<span>PASSWORD</span>
            </p>
            <div className="neo-subtitle mt-2">Enter your email to receive a reset link</div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <label className="neo-label">Email Address</label>
              <input
                type="email"
                placeholder="Registered Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neo-input"
              />
            </div>

            <button type="submit" className="neo-button">
              Send Reset Link
              <svg className="neo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="neo-subtitle hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
