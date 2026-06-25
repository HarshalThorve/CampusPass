import { AlertCircle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#0A0A0A]/80 backdrop-blur-lg" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[#161616] border border-white/10 rounded-2xl shadow-2xl p-6 z-10">
        <div className="flex items-start space-x-3 mb-6">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${danger ? 'text-[#E76F51]' : 'text-emerald-500'}`} />
          <div>
            <h3 className="text-base font-bold text-[#FAF7F2] font-sans">{title}</h3>
            <p className="text-sm text-[rgba(250,247,242,0.65)] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button onClick={onCancel} className="btn-ghost py-2 text-xs w-full sm:w-auto">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`py-2 text-xs px-5 font-bold uppercase tracking-wider rounded-lg border-none transition-all duration-200 w-full sm:w-auto cursor-pointer ${
              danger
                ? 'bg-[#E76F51] text-[#FAF7F2] hover:brightness-110'
                : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
