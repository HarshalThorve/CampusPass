const AuthLoading = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-12 bg-transparent">
    <div className="w-10 h-10 border-2 border-[#FFB86C] border-t-transparent rounded-full animate-spin" />
    <p className="mt-4 text-[rgba(250,247,242,0.55)] font-mono text-sm uppercase tracking-wider">Loading...</p>
  </div>
);

export default AuthLoading;
