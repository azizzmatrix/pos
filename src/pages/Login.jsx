import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/userApi";
import "./auth.css";

function Login() {
  const [form, setForm] = useState({ userName: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(form);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container" >
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don’t have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}

export default Login;

