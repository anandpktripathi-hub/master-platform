import React from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";

const CmsMenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchMenuItems() {
      setLoading(true);
      setError(null);
      try {
        // Replace with actual API endpoint for CMS menu items
        const response = await import('../../services/api').then(({ default: api }) => api.get('/cms/menu'));
        setMenuItems(response.menuItems || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    }
    fetchMenuItems();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">CMS Menu Management</h2>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
          <ul className="list-disc pl-6">
            {menuItems.map((item: any) => (
              <li key={item._id || item.id}>{item.label || item.name}</li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default CmsMenuManagement;
