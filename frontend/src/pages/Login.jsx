import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { supabase } from '../services/supabase';

const Login = () => {
  const { login, user } = useAuth();
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
    <div className="flex-1 flex flex-col justify-center items-center py-16 px-4 bg-transparent relative select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04), transparent)' }} />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(52, 211, 153, 0.03), transparent)' }} />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#FAF7F2]">
              CAMPUSPASS
            </span>
            <span className="text-white/20 text-xs font-semibold">//</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#FAF7F2] font-sans m-0">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[rgba(250,247,242,0.45)] font-sans m-0">
            Sign in to check out tickets and view history
          </p>
        </div>

        {/* Login Form Card */}
        <div className="custom-card space-y-6">
          {error && (
            <div className="flex items-center space-x-2 bg-[#E76F51]/10 border border-[#E76F51]/20 p-3 rounded-xl text-[#E76F51] text-xs font-mono">
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
                  className="input-field pl-10 text-sm w-full"
                  placeholder="name@college.edu"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.4)]" />
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
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.4)]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg py-3 text-xs uppercase transition-colors border-none cursor-pointer flex justify-center items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>SIGN IN</span>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-[#FAF7F2]/10 w-full"></div>
            <span className="absolute bg-[#111111] px-3 text-[10px] uppercase tracking-widest text-[#FAF7F2]/45 font-mono">
              or
            </span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 bg-white/[0.02] hover:bg-white/[0.06] active:bg-white/[0.1] border border-[#FAF7F2]/10 hover:border-emerald-500/30 rounded-xl py-3 px-4 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(16,185,129,0.08)] disabled:opacity-50"
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
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors no-underline"
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
