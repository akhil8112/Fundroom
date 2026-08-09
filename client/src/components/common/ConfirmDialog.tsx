import React from 'react';
import { Modal } from './Modal';
import { HiOutlineExclamationTriangle, HiOutlineInformationCircle } from 'react-icons/hi2';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message, type = 'danger', isLoading
}) => {
  const Icon = type === 'danger' ? HiOutlineExclamationTriangle : HiOutlineInformationCircle;
  const color = type === 'danger' ? 'var(--danger)' : 'var(--info)';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ color, background: `${color}20`, padding: '12px', borderRadius: '50%' }}>
          <Icon size={24} />
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
        <button 
          className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
          onClick={onConfirm} 
          disabled={isLoading}
        >
          {isLoading ? 'Confirming...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
};
