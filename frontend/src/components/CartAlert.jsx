import React from 'react';
import { Alert } from 'react-bootstrap';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartAlert.css';

const CartAlert = () => {
  const { showAlert, alertMessage } = useCart();

  if (!showAlert) return null;

  return (
    <div 
      className="cart-alert position-fixed top-0 end-0 m-4 shadow-lg" 
      style={{ 
        zIndex: 1050,
        backgroundColor: '#48BB78',
        borderColor: '#48BB78',
        color: '#2d3748',
        border: 'none',
        borderRadius: '12px',
        padding: '16px 20px',
        minWidth: '300px',
        animation: 'slideInRight 0.3s ease'
      }}
    >
      <div className="d-flex align-items-center">
        <ShoppingCart className="me-3" size={20} style={{ color: '#347928' }} />
        <div>
          <strong style={{ color: '#347928' }}>Success!</strong>
          <div className="mt-1">{alertMessage}</div>
        </div>
      </div>
    </div>
  );
};

export default CartAlert; 