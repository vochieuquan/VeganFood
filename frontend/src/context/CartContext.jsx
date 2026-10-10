import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showNotification = (product) => {
    setAlertMessage(`Added ${product.name} to cart!`);
    setShowAlert(true);
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const value = {
    showNotification,
    showAlert,
    alertMessage
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};