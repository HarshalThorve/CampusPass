import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err || 'Registration failed. Please try again.');
      setLoading(false);
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
            Create account
          </h2>
          <p className="mt-2 text-sm text-dark-400">
            Sign up to buy passes and attend university events
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-300/50 border border-dark-500/15 p-8 rounded-2xl space-y-6">

          {error && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 text-xs font-mono animate-fade-in">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 bg-lime-400/10 border border-lime-400/20 p-3 rounded-xl text-lime-400 text-xs font-mono animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Registration successful! Logging in...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field-enhanced pl-10 text-sm"
                  placeholder="Rahul Sharma"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-500" />
              </div>
            </div>

            <div>
              <label className="label-field">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field-enhanced pl-10 text-sm"
                  placeholder="rahul@college.edu"
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
                  placeholder="Min. 6 characters"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-500" />
              </div>
            </div>

            <div>
              <label className="label-field">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field-enhanced pl-10 text-sm"
                  placeholder="Repeat your password"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-dark-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full btn-primary py-3 text-xs flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-surface-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>CREATE ACCOUNT</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-dark-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-lime-400 hover:text-lime-300 transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
