import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '' });
  const db = getFirestore();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const menuCollection = collection(db, 'menu_items');
    const menuSnapshot = await getDocs(menuCollection);
    const menuList = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenuItems(menuList);
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'menu_items'), {
        ...newItem,
        price: Number(newItem.price)
      });
      setNewItem({ name: '', description: '', price: '', category: '' });
      fetchMenuItems();
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  return (
    <div>
      <h1>Menu Management</h1>
      <form onSubmit={addMenuItem}>
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
          placeholder="Item Name"
          required
        />
        <input
          type="text"
          value={newItem.description}
          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
          placeholder="Description"
          required
        />
        <input
          type="number"
          value={newItem.price}
          onChange={(e) => setNewItem({...newItem, price: e.target.value})}
          placeholder="Price"
          required
        />
        <input
          type="text"
          value={newItem.category}
          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
          placeholder="Category"
          required
        />
        <button type="submit">Add Item</button>
      </form>
      <h2>Menu Items:</h2>
      <ul>
        {menuItems.map(item => (
          <li key={item.id}>
            {item.name} - {item.price} MKD - {item.category}
            <button onClick={() => deleteMenuItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MenuManagement;