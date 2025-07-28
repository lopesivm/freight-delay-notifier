import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100 opacity-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
