import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Master Platform
              </h1>
              <p className="text-xl text-gray-600">
                Complete Multi-Tenant SaaS Solution
              </p>
              <div className="mt-8 space-x-4">
                <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Products
                </a>
                <a href="/login" className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300">
                  Login
                </a>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
