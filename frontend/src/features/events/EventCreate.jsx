import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/Input';
import Button from '../../components/Button';

const EventCreate = () => {
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '',
    category: '', ticketPrice: 0, totalTickets: 100,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', { ...form, availableTickets: form.totalTickets });
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Event title" />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" rows="4" placeholder="Event description" />
        </div>
        <Input label="Date" type="datetime-local" name="date" value={form.date} onChange={handleChange} />
        <Input label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Event location" />
        <Input label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Music, Tech, Sports" />
        <Input label="Ticket Price (Rs.)" type="number" name="ticketPrice" value={form.ticketPrice} onChange={handleChange} />
        <Input label="Total Tickets" type="number" name="totalTickets" value={form.totalTickets} onChange={handleChange} />
        <Button type="submit" className="w-full">Create Event</Button>
      </form>
    </div>
  );
};

export default EventCreate;
