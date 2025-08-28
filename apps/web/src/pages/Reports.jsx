import { useAuth } from "../auth/AuthContext";
import Layout from "../layouts/Layout";
import usePageTitle from "../hooks/usePageTitle";

export default function Reports() {
  const { user } = useAuth();
  
  // Set page title
  usePageTitle("Reports");

  return (
    <Layout 
      title="Reports" 
      subtitle="Generate and view reports for your organization"
    >
      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            The reports feature is currently under development. You'll be able to generate and view detailed reports about your organization's activities.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Feature in development
          </div>
        </div>
    </Layout>
  );
}
