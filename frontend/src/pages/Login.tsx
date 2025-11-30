import React, { useState } from 'react';
import { authApi } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('token', response.accessToken);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      onLogin();
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-lg border border-slate-800">
        <h1 className="text-3xl font-bold mb-6 text-center text-teal-500">Smetasc SaaS</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {error && <div className="bg-red-900 text-red-200 p-3 rounded text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-medium py-2 rounded transition"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Default: admin@example.com / password
        </p>
      </div>
    </div>
  );
}
