import { useState, FC, ChangeEvent, useRef, useEffect, useMemo } from "react";
import { MoreVertical, Edit, Trash, Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useUsers, useDeleteUser, useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import UserForm from "./UserForm";
import type { User } from "@/lib/api";

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const UserTable: FC = () => {
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [showUserForm, setShowUserForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Debounce search input to prevent too many API calls
  const debouncedSearch = useDebounce(search, 500); // 500ms delay

  // API hooks
  const { 
    data: usersResponse, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useUsers({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    role: roleFilter !== "All" ? roleFilter : undefined,
  });

  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // currentPage reset is handled by useEffect
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    // currentPage reset is handled by useEffect
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        setOpenMenuId(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
    setOpenMenuId(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        // Update existing user
        await updateUserMutation.mutateAsync({
          id: editingUser._id,
          data: formData
        });
      } else {
        // Create new user
        await createUserMutation.mutateAsync(formData);
      }
      setShowUserForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleFormClose = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get pagination info
  const users = usersResponse?.data || [];
  const totalItems = usersResponse?.total || 0;
  const totalPages = usersResponse?.totalPages || Math.ceil(totalItems / itemsPerPage);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // close action menus when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white p-4 shadow rounded mt-6">
      {/* Top Bar with Add Button & Filters */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Users</h3>
        <button 
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="flex justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search users..."
            className="border px-3 py-2 rounded w-full"
            value={search}
            onChange={handleSearch}
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        <select
          className="border px-3 py-2 rounded"
          value={roleFilter}
          onChange={handleRoleChange}
        >
          <option value="All">All Roles</option>
          <option value="admin">Admin</option>
          <option value="ngo_user">NGO User</option>
          <option value="ngo_manager">NGO Manager</option>
          <option value="ngo_operator">NGO Operator</option>
          <option value="ngo_ground_staff">NGO Ground Staff</option>
          <option value="municipality_user">Municipality User</option>
          <option value="municipality_manager">Municipality Manager</option>
          <option value="municipality_operator">Municipality Operator</option>
          <option value="municipality_ground_staff">Municipality Ground Staff</option>
          <option value="app_user">App User</option>
          <option value="citizen">Citizen</option>
          <option value="highrisk_area_user">High Risk Area User</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading users...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-8 text-red-600">
          <AlertCircle className="h-8 w-8 mb-2" />
          <span className="mb-2">Error loading users: {error?.message}</span>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Organization</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody ref={menuRef as any}>
                {users.map((user: User) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{user.name}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-2 border">{user.organization_name || '-'}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-2 border text-center relative">
                      {/* Action Button */}
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === user._id ? null : user._id)
                        }
                        className="p-2 rounded hover:bg-gray-200"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === user._id && (
                        <div className="absolute right-2 mt-2 w-32 bg-white border rounded shadow-md z-50">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={deleteUserMutation.isPending}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No users found */}
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} users
                {(debouncedSearch || roleFilter !== "All") && (
                  <span className="ml-2 text-blue-600">
                    (filtered{debouncedSearch && ` by "${debouncedSearch}"`})
                  </span>
                )}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          isLoading={createUserMutation.isPending || updateUserMutation.isPending}
          municipalities={[]} // We'll need to fetch these
          ngos={[]} // We'll need to fetch these
        />
      )}
    </div>
  );
};

export default UserTable;
