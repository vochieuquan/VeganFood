import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Carousel from '../../components/Carousel';
import Chatbot from '../../components/Chatbot';
import { getCartItems, updateCartItem, removeCartItem } from '../../api/card';

// CartItem Component
const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <div key={item.id} className="cart-item">
    <img src={item.image} alt={item.name} />
    <div className="item-details">
      <h3>{item.name}</h3>
      <p className="price">{item.price.toLocaleString()}₫</p>
    </div>
    <div className="quantity-controls">
      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
      <span>{item.quantity}</span>
      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
    </div>
    <p className="item-total">{(item.price * item.quantity).toLocaleString()}₫</p>
<button
  type="button"
  className="remove-btn"
  onClick={() => onRemove(item.id)}
>
  ×
</button>
  </div>
);

// CartSummary Component
const CartSummary = ({ subtotal, shippingFee = 20000, cartItems }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/cart/order', {
      state: {
        cartItems,
        subtotal,
        shippingFee,
      },
    });
  };

  const handleContinueBuy = () => {
    navigate('/');
  };

  return (
    <div className="cart-summary">
      <h2>Cart Summary</h2>
      <div className="summary-row">
        <span>Subtotal:</span>
        <span>{subtotal.toLocaleString()}₫</span>
      </div>
      <div className="summary-row">
        <span>Shipping Fee:</span>
        <span>{shippingFee.toLocaleString()}₫</span>
      </div>
      <div className="summary-row total">
        <span>Total:</span>
        <span>{(subtotal + shippingFee).toLocaleString()}₫</span>
      </div>
      <button className="checkout-btn" onClick={handleCheckout}>
        Proceed to Checkout
      </button>
      <button className="continue-shopping" onClick={handleContinueBuy}>
        Continue Shopping
      </button>
    </div>
  );
};

// Main CartPage Component
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items using DTO API
  const fetchCartItems = () => {
    getCartItems()
      .then((items) => {
        const mapped = (items || []).map((item) => ({
          id: item.productId,
          name: item.productName,
          price: item.productPrice,
          quantity: item.quantity,
          image: item.imageUrl || "/placeholder.svg?height=80&width=80",
        }));
        setCartItems(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch cart items:", err);
        setCartItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity >= 1) {
      updateCartItem({ productId: id, quantity: newQuantity })
        .then(fetchCartItems)
        .catch(console.error);
    }
  };

  const removeItem = (id) => {
  removeCartItem({ productId: id })
    .then(() => {
      setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
    })
    .catch(console.error);
};




  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div>Loading...</div>;

  // Calculate if we need to show scroll (more than 8 items)
  const showScroll = cartItems.length > 5;
  
  return (
    <div className="cart-page" style={{ zoom: 0.8 }}>
      <Header />
      <Carousel />
      <main className="cart-container">
        <h1>My Cart</h1>
        <div className="cart-content">
          <div className={`cart-items ${showScroll ? 'scrollable' : ''}`}>
            {[...cartItems].reverse().map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
          <CartSummary subtotal={total} cartItems={cartItems} />
        </div>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default CartPage;
