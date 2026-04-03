import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8 md:p-12 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Please enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              autoFocus
              type="password"
              placeholder="••••••••"
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl text-center text-2xl tracking-widest focus:outline-none transition-all duration-200 ${
                error ? 'border-rose-500 animate-shake bg-rose-50' : 'border-slate-100 focus:border-blue-500 focus:bg-white'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p className="text-rose-500 text-sm font-bold mt-3 text-center animate-in fade-in slide-in-from-top-1">
                Invalid access code. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/30"
          >
            Unlock Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
