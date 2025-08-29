import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Layout from "../../layouts/Layout";
import usePageTitle from "../../hooks/usePageTitle";

// Indian States array
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function MunicipalitiesManagement() {
  const { user: currentUser, impersonate } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle("Municipality Management");
  
  // Get parent ID from URL params
  const parentId = searchParams.get('parentId');
  const [parentUser, setParentUser] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "municipalityAdmin",
    password: "",
    municipalityName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: ""
  });

  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "municipalityAdmin",
    municipalityName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: ""
  });

  useEffect(() => {
    fetchUsers();
    fetchParentUser();
  }, [parentId]);

  const fetchParentUser = async () => {
    if (!parentId) {
      setParentUser(null);
      return;
    }
    
    try {
      const response = await api.get(`/users/${parentId}`);
      setParentUser(response.data);
    } catch (err) {
      console.error("Failed to fetch parent user:", err);
      setParentUser(null);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = "/users";
      
      if (parentId) {
        // Fetch child users (operators and groundStaff) for the parent
        url = `/users?parentId=${parentId}`;
      } else {
        // Fetch all users and filter for municipality admins only
        const response = await api.get(url);
        const municipalityUsers = (response.data || []).filter(user => 
          user.role === "municipalityAdmin"
        );
        setUsers(municipalityUsers);
        setError("");
        setLoading(false);
        return;
      }
      
      const response = await api.get(url);
      setUsers(response.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch municipality users");
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const handleViewChildUsers = (userId) => {
    navigate(`/admin/municipalities?parentId=${userId}`);
  };

  const handleBackToAllUsers = () => {
    navigate('/admin/municipalities');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete user");
    }
  };

  const handleImpersonate = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to impersonate ${targetUser.name} (${targetUser.email})?`)) {
      return;
    }
    
    try {
      const result = await impersonate(targetUser._id);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || "Failed to impersonate user");
      }
    } catch (err) {
      setError("Failed to impersonate user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Add parent ID if we're creating child users
      const userData = parentId ? { ...newUser, parentId } : newUser;
      
      const response = await api.post("/users", userData);
      setUsers([...users, response.data]);
      setShowAddModal(false);
      setNewUser({ 
        name: "", 
        email: "", 
        role: parentId ? "operators" : "municipalityAdmin", 
        password: "",
        municipalityName: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        pincode: "",
        phoneNumber: ""
      });
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await api.put(`/users/${userId}`, updates);
      setUsers(users.map(u => u._id === userId ? response.data : u));
      setSelectedUser(null);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.municipalityName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "municipalityAdmin": return "bg-green-100 text-green-800";
      case "operators": return "bg-blue-100 text-blue-800";
      case "groundStaff": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout 
      title={parentId ? `Child Users - ${parentUser?.name || 'Loading...'}` : "Municipality Management"} 
      subtitle={parentId ? `Manage operators and ground staff for ${parentUser?.name || 'Loading...'}` : "Manage municipal organizations and users"}
      action={
        <div className="flex items-center space-x-3">
          {parentId && (
            <button
              onClick={handleBackToAllUsers}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to All Municipalities</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{parentId ? 'Add Child User' : 'Add Municipality User'}</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Municipality Users</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or municipality name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Municipality Users ({filteredUsers.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading municipality users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No municipality users found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {/* Make username/email clickable for municipality admin roles that can have child users */}
                          {!parentId && user.role === 'municipalityAdmin' ? (
                            <div>
                              <button
                                onClick={() => handleViewChildUsers(user._id)}
                                className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline transition-colors duration-200"
                              >
                                {user.name}
                              </button>
                              <button
                                onClick={() => handleViewChildUsers(user._id)}
                                className="block text-sm text-green-500 hover:text-green-700 hover:underline transition-colors duration-200"
                              >
                                {user.email}
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.municipalityName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setEditUser({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            municipalityName: user.municipalityName || "",
                            address: user.address || "",
                            address2: user.address2 || "",
                            city: user.city || "",
                            state: user.state || "",
                            pincode: user.pincode || "",
                            phoneNumber: user.phoneNumber || ""
                          });
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Edit
                      </button>
                      {/* Only show impersonate button for admins and if not the same user */}
                      {currentUser?.role?.toLowerCase() === 'admin' && currentUser?._id !== user._id && (
                        <button
                          onClick={() => handleImpersonate(user)}
                          className="text-orange-600 hover:text-orange-900 transition-colors duration-200 mr-3"
                        >
                          Impersonate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="modal-content bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Municipality User</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {parentId ? (
                    <>
                      <option value="operators">Operators</option>
                      <option value="groundStaff">Ground Staff</option>
                    </>
                  ) : (
                    <option value="municipalityAdmin">Municipality Admin</option>
                  )}
                </select>
              </div>
              {!parentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipality Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.municipalityName}
                    onChange={(e) => setNewUser({ ...newUser, municipalityName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}
              
              {/* Address fields - only show for parent users (not child users) */}
              {!parentId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address 2 (Optional)</label>
                    <input
                      type="text"
                      value={newUser.address2}
                      onChange={(e) => setNewUser({ ...newUser, address2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newUser.city}
                        onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <select
                        required
                        value={newUser.state}
                        onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        title="Pincode must be 6 digits"
                        value={newUser.pincode}
                        onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        title="Phone number must be 10 digits"
                        value={newUser.phoneNumber}
                        onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUser({ 
                      name: "", 
                      email: "", 
                      role: "municipalityAdmin", 
                      password: "",
                      municipalityName: "",
                      address: "",
                      address2: "",
                      city: "",
                      state: "",
                      pincode: "",
                      phoneNumber: ""
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="modal-content bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(selectedUser._id, editUser);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipality Name</label>
                <input
                  type="text"
                  required
                  value={editUser.municipalityName}
                  onChange={(e) => setEditUser({ ...editUser, municipalityName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}