import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import authorizedEmailService from "../../services/authorizedEmailService";

function Register() {
  const [formData, setFormData] = useState({
    usn: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    whatsappNumber: "",
    branch: "",
    batchYear: ""
  });
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (e.target.name === 'email') {
      setEmailError("");
    }
    setError("");
  };

  const handleEmailBlur = async () => {
    if (!formData.email) return;

    try {
      setChecking(true);
      const result = await authorizedEmailService.checkEmailAuthorization(formData.email);
      if (!result.authorized) {
        setEmailError("This email is not authorized for registration. Please contact the placement office.");
      } else {
        setEmailError("");
      }
    } catch (err) {
      // Silent fail - will be caught during registration
      console.error('Email check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usn || !formData.email || !formData.password || !formData.fullName || !formData.branch || !formData.batchYear) {
      setError("All fields are required");
      return;
    }

    if (emailError) {
      setError("Please fix the email error before proceeding");
      return;
    }

    try {
      await authService.register(formData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";

      // Highlight email authorization errors
      if (errorMessage.includes('not authorized') || errorMessage.includes('already been used')) {
        setEmailError(errorMessage);
        setError("Email Authorization Error - " + errorMessage);
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="neo-page-container neo-theme-student">
      <div className="max-w-xl w-full relative">
        <div className="neo-form">
          <div className="text-center mb-4">
            <p className="neo-title">
              STUDENT<span>REGISTRATION</span>
            </p>
            <div className="neo-subtitle mt-2">Join the placement management system</div>
          </div>

          {error && (
            <div className="neo-error mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <label className="neo-label">USN</label>
              <input
                type="text"
                name="usn"
                placeholder="e.g., 1MS21CS001"
                value={formData.usn}
                onChange={handleChange}
                className="neo-input"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="neo-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Your Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="neo-input"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="neo-label">Email</label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                className={`neo-input ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && (
                <div className="neo-error-text text-red-600 text-sm">
                  {emailError}
                </div>
              )}
              {checking && <div className="text-sm text-indigo-600">Checking email...</div>}
            </div>

            <div className="flex flex-col gap-4">
              <label className="neo-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="6+ characters"
                value={formData.password}
                onChange={handleChange}
                className="neo-input"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="neo-label">Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="neo-input"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="neo-label">WhatsApp Number</label>
              <input
                type="tel"
                name="whatsappNumber"
                placeholder="WhatsApp Number"
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="neo-input"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="neo-label">Branch</label>
              <input
                type="text"
                name="branch"
                placeholder="e.g., Computer Science"
                value={formData.branch}
                onChange={handleChange}
                className="neo-input"
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="neo-label">Batch Year</label>
              <input
                type="number"
                name="batchYear"
                placeholder="e.g., 2021"
                value={formData.batchYear}
                onChange={handleChange}
                className="neo-input"
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <button type="submit" className="neo-button bg-[#ffffff]">
                Register
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-4 mt-4">
            <div className="neo-separator">
              <div></div>
              <span>OR</span>
              <div></div>
            </div>
            <div className="text-center">
              <p className="neo-subtitle">
                Already have an account? <Link to="/login" className="neo-accent-link underline">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
