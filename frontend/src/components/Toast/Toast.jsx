import { useEffect } from 'react';
import './Toast.scss';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <span className="toast-message">{message}</span>
    </div>
  );
}
