import { useEffect } from 'react';
import { CheckCircle2, ShieldAlert, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getToastClasses = () => {
    switch (type) {
      case 'error':
        return 'bg-[#E76F51]/10 border-[#E76F51]/20 text-[#E76F51]';
      case 'info':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'success':
      default:
        return 'bg-[#8AC926]/10 border-[#8AC926]/20 text-[#8AC926]';
    }
  };

  const getToastIcon = () => {
    if (type === 'error') {
      return <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />;
    } else if (type === 'info') {
      return <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />;
    } else {
      return <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[70]">
      <div
        className={`flex items-start space-x-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${getToastClasses()}`}
      >
        {getToastIcon()}
        <p className="text-xs font-mono flex-1">{message}</p>
        <button onClick={onClose} className="text-[rgba(250,247,242,0.5)] hover:text-[#FAF7F2] transition-colors bg-transparent border-none p-0 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
