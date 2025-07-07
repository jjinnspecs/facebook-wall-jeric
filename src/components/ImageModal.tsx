'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

type ImageModalProps = {
  src: string;
  onClose: () => void;
};

export default function ImageModal({ src, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        aria-label="Close"
      >
        <X size={32} />
      </button>
      <img
        src={src}
        alt="Full view"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-lg"
      />
    </div>
  );
}
