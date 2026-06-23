import { useEffect } from 'react';
import { CheckCircle2, ShieldAlert, X } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[70]">
      <div
        className={`flex items-start space-x-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${
          isError
            ? 'bg-[#E76F51]/10 border-[#E76F51]/20 text-[#E76F51]'
            : 'bg-[#8AC926]/10 border-[#8AC926]/20 text-[#8AC926]'
        }`}
      >
        {isError ? (
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
        )}
        <p className="text-xs font-mono flex-1">{message}</p>
        <button onClick={onClose} className="text-[rgba(250,247,242,0.5)] hover:text-[#FAF7F2] transition-colors bg-transparent border-none p-0 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
