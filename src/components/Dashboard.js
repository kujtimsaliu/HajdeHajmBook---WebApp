import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const db = getFirestore();

  useEffect(() => {
    fetchOrders();
  }, [selectedDate]);

  const fetchOrders = async () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const ordersCollection = collection(db, 'orders');
    const q = query(
      ordersCollection,
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );

    const orderSnapshot = await getDocs(q);
    const orderList = orderSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      date: doc.data().date.toDate() // Convert Timestamp back to Date
    }));
    setOrders(orderList.sort((a, b) => a.userName.localeCompare(b.userName)));
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
      <h2>Total Revenue: {orders.reduce((sum, order) => sum + order.total, 0)} MKD</h2>
      <Link to="/create-order">
        <button>Create New Order</button>
      </Link>
      <button onClick={copyOrdersToClipboard}>Copy Orders</button>
      <h3>Orders:</h3>
      {orders.map(order => (
        <div key={order.id} style={{border: '1px solid #ccc', margin: '10px', padding: '10px'}}>
          <h4>{order.userName}</h4>
          <p>Date: {order.date.toLocaleString()}</p>
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
  function copyOrdersToClipboard() {
    const orderSummary = orders.map(order => {
      const items = order.items.map(item => `${item.quantity} x ${item.menuItem.name}`).join('\n');
      return `${items}\n`;
    }).join('\n');
    
    navigator.clipboard.writeText(orderSummary).then(() => {
      alert('Orders copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }
}
export default Dashboard;