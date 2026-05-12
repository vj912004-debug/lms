"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div 
            key="modal-root"
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 1000, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            {/* Backdrop */}
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)'
              }}
            />

            {/* Content */}
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card"
              style={{ 
                width: '100%', 
                maxWidth: '500px', 
                position: 'relative', 
                zIndex: 1001,
                padding: '0',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                padding: '24px', 
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{title}</h2>
                <button 
                  onClick={onClose}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px'
                  }}
                  className="hover-bg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '24px' }}>
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .hover-bg:hover {
          background: var(--glass);
          color: white;
        }
      `}</style>
    </>
  );
}
