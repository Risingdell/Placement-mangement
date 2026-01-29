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
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <h2>Student Registration</h2>

        <input
          type="text"
          name="usn"
          placeholder="USN (e.g., 1MS21CS001)"
          value={formData.usn}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          value={formData.password}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <input
          type="text"
          name="branch"
          placeholder="Branch (e.g., Computer Science)"
          value={formData.branch}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <input
          type="number"
          name="batchYear"
          placeholder="Batch Year (e.g., 2021)"
          value={formData.batchYear}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <button type="submit" style={{ width: '100%', padding: '10px', margin: '10px 0', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
          Register
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
