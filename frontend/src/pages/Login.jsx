import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, Key } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err || 'Failed to login. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoUser = (role) => {
    if (role === 'admin') {
      setEmail('admin@campuspass.com');
      setPassword('admin123');
    } else {
      setEmail('rahul@campuspass.com');
      setPassword('student123');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 bg-surface-950 relative">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(140,255,20,0.06), transparent)' }}></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(168,34,178,0.08), transparent)' }}></div>

      <div className="w-full max-w-md space-y-8 relative z-10">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="w-3 h-3 rounded-full bg-lime-400 shadow-neon"></span>
            <span className="font-mono font-bold text-xs tracking-[0.2em] text-dark-200 uppercase">Campus//</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-dark-100">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-dark-400">
            Sign in to check out tickets and view history
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-300/50 border border-dark-500/15 p-8 rounded-2xl space-y-6">

          {error && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 text-xs font-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field-enhanced pl-10 text-sm"
                  placeholder="name@college.edu"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-500" />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field-enhanced pl-10 text-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-surface-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>SIGN IN</span>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="pt-4 border-t border-dark-500/10 space-y-3">
            <p className="text-[10px] font-mono text-dark-500 uppercase tracking-[0.2em] flex items-center">
              <Key className="w-3 h-3 mr-1.5" />
              QUICK DEMO ACCOUNTS
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => autofillDemoUser('student')}
                className="px-3 py-2.5 text-[11px] font-mono font-medium rounded-xl bg-surface-400/50 border border-dark-500/10 hover:border-lime-400/30 text-dark-300 hover:text-lime-400 transition-all tracking-wider uppercase"
              >
                Demo Student
              </button>
              <button
                onClick={() => autofillDemoUser('admin')}
                className="px-3 py-2.5 text-[11px] font-mono font-medium rounded-xl bg-surface-400/50 border border-dark-500/10 hover:border-lime-400/30 text-dark-300 hover:text-lime-400 transition-all tracking-wider uppercase"
              >
                Demo Admin
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-dark-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-lime-400 hover:text-lime-300 transition-colors"
            >
              Register →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
