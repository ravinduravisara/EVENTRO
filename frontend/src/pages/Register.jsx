import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <Input label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
      <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your email" />
      <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Choose a password" />
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
          <option value="user">User</option>
          <option value="organizer">Organizer</option>
        </select>
      </div>
      <Button type="submit" className="w-full">Register</Button>
      <p className="text-center mt-4 text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-primary">Login</Link>
      </p>
    </form>
  );
};

export default Register;
