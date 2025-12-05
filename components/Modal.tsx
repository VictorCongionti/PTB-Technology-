import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl bg-[#16162a] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-slide-up">
        <div className="sticky top-0 bg-[#16162a]/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all p-2"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
