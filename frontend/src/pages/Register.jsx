import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, navigate, redirectPath]);

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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/login'
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-16 px-4 bg-[#1A1612] relative select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(255,184,108,0.06), transparent)' }} />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(233,196,106,0.04), transparent)' }} />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FFB86C]" />
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#FAF7F2]">
              CAMPUSPASS
            </span>
            <span className="text-white/20 text-xs font-semibold">//</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#FAF7F2] font-sans m-0">
            Create account
          </h2>
          <p className="mt-2 text-sm text-[rgba(250,247,242,0.45)] font-sans m-0">
            Sign up to buy passes and attend university events
          </p>
        </div>

        {/* Register Card */}
        <div className="custom-card space-y-6">
          {error && (
            <div className="flex items-center space-x-2 bg-[#E76F51]/10 border border-[#E76F51]/20 p-3 rounded-xl text-[#E76F51] text-xs font-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 bg-[#8AC926]/10 border border-[#8AC926]/20 p-3 rounded-xl text-[#8AC926] text-xs font-mono">
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
                  className="input-field pl-10 text-sm w-full"
                  placeholder="Rahul Sharma"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.45)]" />
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
                  className="input-field pl-10 text-sm w-full"
                  placeholder="rahul@college.edu"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.45)]" />
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
                  className="input-field pl-10 text-sm w-full"
                  placeholder="Min. 6 characters"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.45)]" />
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
                  className="input-field pl-10 text-sm w-full"
                  placeholder="Repeat your password"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.45)]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full btn-primary py-3 text-xs uppercase"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#1A1612] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>CREATE ACCOUNT</span>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-[#FAF7F2]/10 w-full"></div>
            <span className="absolute bg-[#1F1B16] px-3 text-[10px] uppercase tracking-widest text-[#FAF7F2]/45 font-mono">
              or
            </span>
          </div>

          <button
            type="button"
            disabled={loading || success}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 bg-white/[0.02] hover:bg-white/[0.06] active:bg-white/[0.1] border border-[#FAF7F2]/10 hover:border-[#FFB86C]/30 rounded-xl py-3 px-4 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(255,184,108,0.08)] disabled:opacity-50"
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.9 3C17.782 1.145 15.055 0 12 0 7.336 0 3.336 2.686 1.41 6.605l3.856 3.16z"
              />
              <path
                fill="#FBBC05"
                d="M1.41 6.605A7.127 7.127 0 0 0 .73 12c0 1.92.5 3.73 1.38 5.345l4.03-3.13a4.78 4.78 0 0 1-.74-2.215c0-.986.26-1.92.74-2.735L1.41 6.605z"
              />
              <path
                fill="#4285F4"
                d="M12 24c3.245 0 5.973-1.077 7.964-2.927l-3.837-2.977c-1.127.755-2.564 1.205-4.127 1.205-3.173 0-5.855-2.145-6.81-5.045L1.264 17.37C3.164 21.314 7.245 24 12 24z"
              />
              <path
                fill="#34A853"
                d="M23.27 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.327a5.41 5.41 0 0 1-2.345 3.545l3.837 2.977C22.064 19.11 23.27 16.01 23.27 12.273z"
              />
            </svg>
            <span className="text-[11px] font-semibold tracking-wider text-[#FAF7F2]/80 uppercase font-sans">
              Continue with Google
            </span>
          </button>

          <div className="text-center pt-2 text-xs text-[rgba(250,247,242,0.45)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#FFB86C] hover:text-[#E9C46A] transition-colors no-underline"
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
