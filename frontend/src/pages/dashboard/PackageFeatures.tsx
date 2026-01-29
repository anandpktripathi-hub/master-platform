import React from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";

const PackageFeatures: React.FC = () => {
  const [features, setFeatures] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchFeatures() {
      setLoading(true);
      setError(null);
      try {
        // Replace with actual API endpoint for package features
        const response = await import('../../services/api').then(({ packagesApi }) => packagesApi.get('/packages/features'));
        setFeatures(response.features || response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch package features');
      } finally {
        setLoading(false);
      }
    }
    fetchFeatures();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Package Feature Set</h2>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
          <ul className="list-disc pl-6">
            {features.map((feature: any) => (
              <li key={feature._id || feature.id}>{feature.name || feature.label}</li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PackageFeatures;
