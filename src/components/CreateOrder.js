import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function CreateOrder() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email);
    }
  }, []);

  const fetchMenuItems = async () => {
    const menuCollection = collection(db, 'menu_items');
    const menuSnapshot = await getDocs(menuCollection);
    const menuList = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenuItems(menuList);
  };

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderItems = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        const menuItem = menuItems.find(item => item.id === itemId);

        return {
          menuItem: {
            category: menuItem.category,
            description: menuItem.description,
            name: menuItem.name,
            price: menuItem.price
          },
          quantity
        };
      });

    if (orderItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    const order = {
      id: uuidv4().toUpperCase(), 
      userId: auth.currentUser ? auth.currentUser.uid : null,
      userName: userEmail,
      items: orderItems,
      date: Timestamp.now(),
      isPaid: false
    };

    try {
      await addDoc(collection(db, 'orders'), order);
      alert('Order created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create New Order</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Customer Email"
          required
        />
        <h2>Menu Items:</h2>
        {menuItems.map(item => (
          <div key={item.id}>
            <span>{item.name} - {item.price} MKD</span>
            <input
              type="number"
              min="0"
              value={selectedItems[item.id] || 0}
              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
            />
          </div>
        ))}
        <h3>Total: {calculateTotal()} MKD</h3>
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
}

export default CreateOrder;