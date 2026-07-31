import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/userApi";
import "./auth.css";

function Signup() {
  const [form, setForm] = useState({ userName: "", email: "", password: "", role: "user" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = await signupUser(form);
    if (newUser) {
      alert("User created successfully!");
      navigate("/login");
    } else {
      alert("Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userName"
          placeholder="Username"
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          name="role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
