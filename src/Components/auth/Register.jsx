import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";

function Register() {
  const [formData, setFormData] = useState({
    usn: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    branch: "",
    batchYear: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usn || !formData.email || !formData.password || !formData.fullName || !formData.branch || !formData.batchYear) {
      alert("All fields are required");
      return;
    }

    try {
      await authService.register(formData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="neo-page-container">
      <div className="max-w-xl w-full relative">
        <div className="neo-form">
          <div className="text-center mb-4">
            <p className="neo-title">
              STUDENT<span>REGISTRATION</span>
            </p>
            <div className="neo-subtitle mt-2">Join the placement management system</div>
          </div>

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
                className="neo-input"
              />
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
              <button type="submit" className="neo-button bg-[#4CAF50] !text-white hover:!text-white">
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
                Already have an account? <Link to="/login" className="font-bold underline">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
