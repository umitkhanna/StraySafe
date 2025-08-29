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



export default function UsersManagement() {
  const { user: currentUser, impersonate } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle("User Management");
  
  // Get parent ID from URL params
  const parentId = searchParams.get('parentId');
  const [parentUser, setParentUser] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    ngoName: "",
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
    role: "",
    ngoName: "",
    municipalityName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: ""
  });

  // Function to get allowed roles based on current user's role
  const getAllowedRoles = () => {
    const userRole = currentUser?.role?.toLowerCase(); // Convert to lowercase for comparison
    
    // If viewing child users (parentId exists), only show child roles
    if (parentId) {
      return [
        { value: "operators", label: "Operators" },
        { value: "groundStaff", label: "Ground Staff" }
      ];
    }
    
    if (userRole === "admin") {
      return [
        { value: "ngoAdmin", label: "NGO Admin" },
        { value: "municipalityAdmin", label: "Municipality Admin" }
      ];
    } else if (userRole === "ngoadmin" || userRole === "municipalityadmin") {
      return [
        { value: "operators", label: "Operators" },
        { value: "groundStaff", label: "Ground Staff" }
      ];
    }
    return []; // No roles allowed for other user types
  };

  useEffect(() => {
    fetchUsers();
    fetchParentUser();
    // Set default role based on user permissions
    const allowedRoles = getAllowedRoles();
    if (allowedRoles.length > 0) {
      setNewUser(prev => ({ ...prev, role: allowedRoles[0].value }));
    }
  }, [currentUser, parentId]);

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
      
      const userRole = currentUser?.role?.toLowerCase();
      
      if (parentId) {
        // Fetch child users (operators and groundStaff) for the parent
        url = `/users?parentId=${parentId}`;
      } else if (userRole === 'ngoadmin' || userRole === 'municipalityadmin') {
        // For NGO and Municipality admins, only show their own sub-users
       // url = `/users?parentId=${currentUser._id}`;
        url = `/users?parentId=${currentUser._id}`;
      }
      // When no parentId and user is admin, the API will automatically filter to show only top-level users
      
      const response = await api.get(url);
      setUsers(response.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const handleViewChildUsers = (userId) => {
    navigate(`/admin/users?parentId=${userId}`);
  };

  const handleBackToAllUsers = () => {
    navigate('/admin/users');
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
  };  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Add parent ID if we're creating child users
      const userData = parentId ? { ...newUser, parentId } : newUser;
      
      const response = await api.post("/users", userData);
      setUsers([...users, response.data]);
      setNewUser({ 
        name: "", 
        email: "", 
        role: "user", 
        password: "",
        ngoName: "",
        municipalityName: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        pincode: "",
        phoneNumber: ""
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await api.put(`/users/${userId}`, updates);
      setUsers(users.map(u => u._id === userId ? response.data : u));
      setSelectedUser(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "ngoAdmin": return "bg-blue-100 text-blue-800";
      case "municipalityAdmin": return "bg-purple-100 text-purple-800";
      case "operators": return "bg-green-100 text-green-800";
      case "groundStaff": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPageTitle = () => {
    const userRole = currentUser?.role?.toLowerCase();
    
    if (parentId) {
      return `Child Users - ${parentUser?.name || 'Loading...'}`;
    } else if (userRole === 'ngoadmin' || userRole === 'municipalityadmin') {
      return "My Team";
    } else {
      return "User Management";
    }
  };

  const getPageSubtitle = () => {
    const userRole = currentUser?.role?.toLowerCase();
    
    if (parentId) {
      return `Manage operators and ground staff for ${parentUser?.name || 'Loading...'}`;
    } else if (userRole === 'ngoadmin') {
      return "Manage your NGO team members";
    } else if (userRole === 'municipalityadmin') {
      return "Manage your municipality team members";
    } else {
      return "Manage all users in the system";
    }
  };

  return (
    <Layout 
      title={getPageTitle()} 
      subtitle={getPageSubtitle()}
      action={
        <div className="flex items-center space-x-3">
          {parentId && currentUser?.role?.toLowerCase() === 'admin' && (
            <button
              onClick={handleBackToAllUsers}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to All Users</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-red-600 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>
              {parentId ? 'Add Child User' : 
               (currentUser?.role?.toLowerCase() === 'ngoadmin' || currentUser?.role?.toLowerCase() === 'municipalityadmin') ? 'Add Team Member' : 
               'Add User'}
            </span>
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
      <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Search Users</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Roles</option>
                  {getAllowedRoles().map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-100">
              <h3 className="text-lg font-semibold text-slate-900">
                Users ({filteredUsers.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <p className="mt-2 text-slate-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No users found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-orange-100">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="ml-4">
                              {/* Make username/email clickable for admin roles that can have child users */}
                              {!parentId && (user.role === 'ngoAdmin' || user.role === 'municipalityAdmin') ? (
                                <div>
                                  <button
                                    onClick={() => handleViewChildUsers(user._id)}
                                    className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline transition-colors duration-200"
                                  >
                                    {user.name}
                                  </button>
                                  <button
                                    onClick={() => handleViewChildUsers(user._id)}
                                    className="block text-sm text-orange-500 hover:text-orange-700 hover:underline transition-colors duration-200"
                                  >
                                    {user.email}
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                  <div className="text-sm text-slate-500">{user.email}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-orange-600 hover:text-orange-900 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          {/* Only show impersonate button for admins and if not the same user */}
                          {currentUser?.role?.toLowerCase() === 'admin' && currentUser?._id !== user._id && (
                            <button
                              onClick={() => handleImpersonate(user)}
                              className="text-orange-600 hover:text-orange-900 transition-colors duration-200"
                            >
                              Impersonate
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
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
              <h3 className="text-lg font-semibold text-slate-900">Add New User</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a role</option>
                  {getAllowedRoles().map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {/* NGO Admin specific fields */}
              {newUser.role === "ngoAdmin" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NGO Name</label>
                    <input
                      type="text"
                      required
                      value={newUser.ngoName || ''}
                      onChange={(e) => setNewUser({ ...newUser, ngoName: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  {/* Address fields - only show for parent users (not child users) */}
                  {!parentId && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input
                          type="text"
                          required
                          value={newUser.address || ''}
                          onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address 2 (Optional)</label>
                        <input
                          type="text"
                          value={newUser.address2 || ''}
                          onChange={(e) => setNewUser({ ...newUser, address2: e.target.value })}
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={newUser.city || ''}
                            onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                          <select
                            required
                            value={newUser.state || ''}
                            onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                          <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                          <input
                            type="text"
                            required
                            pattern="[0-9]{6}"
                            title="Pincode must be 6 digits"
                            value={newUser.pincode || ''}
                            onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            title="Phone number must be 10 digits"
                            value={newUser.phoneNumber || ''}
                            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Municipality Admin specific fields */}
              {newUser.role === "municipalityAdmin" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Municipality Name</label>
                    <input
                      type="text"
                      required
                      value={newUser.municipalityName || ''}
                      onChange={(e) => setNewUser({ ...newUser, municipalityName: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={newUser.address || ''}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address 2 (Optional)</label>
                    <input
                      type="text"
                      value={newUser.address2 || ''}
                      onChange={(e) => setNewUser({ ...newUser, address2: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newUser.city || ''}
                        onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <select
                        required
                        value={newUser.state || ''}
                        onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        title="Pincode must be 6 digits"
                        value={newUser.pincode || ''}
                        onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        title="Phone number must be 10 digits"
                        value={newUser.phoneNumber || ''}
                        onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Operators and Ground Staff - no additional fields needed */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUser({ 
                      name: "", 
                      email: "", 
                      role: "user", 
                      password: "",
                      ngoName: "",
                      municipalityName: "",
                      address: "",
                      address2: "",
                      city: "",
                      state: "",
                      pincode: "",
                      phoneNumber: ""
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-colors duration-200"
                >
                  Add User
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
              <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(selectedUser._id, selectedUser);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={selectedUser.name || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={selectedUser.email || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={selectedUser.role || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a role</option>
                  {getAllowedRoles().map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {/* NGO Admin specific fields */}
              {selectedUser.role === "ngoAdmin" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NGO Name</label>
                    <input
                      type="text"
                      required
                      value={selectedUser.ngoName || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, ngoName: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  {/* Address fields - only show for parent users (not child users) */}
                  {!parentId && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input
                          type="text"
                          required
                          value={selectedUser.address || ""}
                          onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address 2 (Optional)</label>
                        <input
                          type="text"
                          value={selectedUser.address2 || ""}
                          onChange={(e) => setSelectedUser({ ...selectedUser, address2: e.target.value })}
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={selectedUser.city || ""}
                            onChange={(e) => setSelectedUser({ ...selectedUser, city: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                          <select
                            required
                            value={selectedUser.state || ""}
                            onChange={(e) => setSelectedUser({ ...selectedUser, state: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                          <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                          <input
                            type="text"
                            required
                            pattern="[0-9]{6}"
                            title="Pincode must be 6 digits"
                            value={selectedUser.pincode || ""}
                            onChange={(e) => setSelectedUser({ ...selectedUser, pincode: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            title="Phone number must be 10 digits"
                            value={selectedUser.phoneNumber || ""}
                            onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Municipality Admin specific fields */}
              {selectedUser.role === "municipalityAdmin" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Municipality Name</label>
                    <input
                      type="text"
                      required
                      value={selectedUser.municipalityName || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, municipalityName: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={selectedUser.address || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address 2 (Optional)</label>
                    <input
                      type="text"
                      value={selectedUser.address2 || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, address2: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={selectedUser.city || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, city: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <select
                        required
                        value={selectedUser.state || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, state: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        title="Pincode must be 6 digits"
                        value={selectedUser.pincode || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        title="Phone number must be 10 digits"
                        value={selectedUser.phoneNumber || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-colors duration-200"
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
