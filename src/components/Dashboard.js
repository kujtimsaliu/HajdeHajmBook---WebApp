import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const db = getFirestore();

  useEffect(() => {
    fetchOrders();
  }, [selectedDate]);

  const fetchOrders = async () => {
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const ordersCollection = collection(db, 'orders');
    const q = query(
      ordersCollection,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );

    const orderSnapshot = await getDocs(q);
    const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOrders(orderList);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <h1>Dashboard</h1>
      <input 
        type="date" 
        value={selectedDate.toISOString().split('T')[0]} 
        onChange={(e) => setSelectedDate(new Date(e.target.value))} 
      />
      <h2>Total Orders: {orders.length}</h2>
      <h2>Total Revenue: {totalRevenue} MKD</h2>
      <Link to="/create-order">
        <button>Create New Order</button>
      </Link>
      <h3>Orders:</h3>
      {orders.map(order => (
        <div key={order.id} style={{border: '1px solid #ccc', margin: '10px', padding: '10px'}}>
          <h4>{order.userName}</h4>
          <p>Total: {order.total} MKD</p>
          <p>Status: {order.isPaid ? 'Paid' : 'Not Paid'}</p>
          <h5>Items:</h5>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.menuItem.name} x {item.quantity} - {item.menuItem.price * item.quantity} MKD
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;