import React, { useEffect, useState } from 'react';
import { usersApi, productsApi, themesApi } from '../services/api';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, productsData, themesData] = await Promise.all([
          usersApi.getAll(1, 10),
          productsApi.getAll(1, 10),
          themesApi.getAll(),
        ]);

        setUsers(usersData.data || []);
        setProducts(productsData.data || []);
        setThemes(themesData || []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="bg-red-900 text-red-200 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
          <h2 className="text-gray-400 text-sm font-medium">Total Users</h2>
          <p className="text-3xl font-bold text-teal-500 mt-2">{users.length}</p>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
          <h2 className="text-gray-400 text-sm font-medium">Total Products</h2>
          <p className="text-3xl font-bold text-teal-500 mt-2">{products.length}</p>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
          <h2 className="text-gray-400 text-sm font-medium">Active Themes</h2>
          <p className="text-3xl font-bold text-teal-500 mt-2">{themes.filter(t => t.isActive).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
          <h3 className="text-xl font-bold mb-4">Recent Users</h3>
          <div className="space-y-2">
            {users.length > 0 ? (
              users.slice(0, 5).map((user) => (
                <div key={user._id} className="flex justify-between items-center p-2 bg-slate-800 rounded">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                  <span className="text-xs bg-teal-600 px-2 py-1 rounded">{user.role}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No users found</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
          <h3 className="text-xl font-bold mb-4">Products</h3>
          <div className="space-y-2">
            {products.length > 0 ? (
              products.slice(0, 5).map((product) => (
                <div key={product._id} className="flex justify-between items-center p-2 bg-slate-800 rounded">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">{product.description || 'No description'}</p>
                  </div>
                  <span className="text-teal-500 font-bold">${product.price}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No products found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
