import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ value, onChange, options, placeholder = 'Select option', className = 'input-field text-sm' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
      const selectedIdx = options.findIndex(opt => opt.value === value);
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleResize = () => updateCoords();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleOutsideClick = (e) => {
        if (
          triggerRef.current && !triggerRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const selectedOption = options.find(opt => opt.value === value);
  const isSmall = className.includes('text-xs');
  const optionTextSize = isSmall ? 'text-xs px-3.5 py-2' : 'text-sm px-4 py-2.5';

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={`${className} flex items-center justify-between text-left transition-all duration-300 outline-none ${
          isOpen ? 'border-[#FFB86C] ring-2 ring-[#FFB86C]/15' : ''
        } ${selectedOption ? 'text-[#FAF7F2]' : 'text-[rgba(250,247,242,0.45)]'}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[rgba(250,247,242,0.45)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FFB86C]' : ''
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            className="fixed rounded-xl bg-[#1A1612] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden max-h-[220px] overflow-y-auto dropdown-scrollbar p-1"
            style={{
              top: `${coords.top + 6}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              boxSizing: 'border-box',
              zIndex: 9999,
            }}
          >
            <div className="flex flex-col gap-0.5">
              {options.map((opt, index) => {
                const isSelected = opt.value === value;
                const isFocused = index === focusedIndex;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`${optionTextSize} cursor-pointer transition-all duration-150 rounded-lg border-l-[3px] ease-in-out outline-none ${
                      isSelected
                        ? 'border-[#FFB86C] text-[#FFB86C] bg-[#FFB86C]/10 font-bold'
                        : isFocused
                        ? 'border-[#FFB86C]/50 bg-[#FFB86C]/5 text-white'
                        : 'border-transparent text-[rgba(250,247,242,0.65)] bg-transparent hover:border-[#FFB86C]/50 hover:bg-[#FFB86C]/5 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomDropdown;
