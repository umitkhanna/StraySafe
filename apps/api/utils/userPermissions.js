// User permission and hierarchy utilities
import User from '../models/User.js';

// Check if user can manage another user
export const canUserManage = async (currentUser, targetUserId) => {
  if (currentUser.role === 'admin') {
    return true;
  }

  // Get the target user
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return false;
  }

  // Same organization check
  if (currentUser.organization_type === targetUser.organization_type) {
    if (currentUser.organization_type === 'municipality') {
      if (currentUser.municipality?.toString() !== targetUser.municipality?.toString()) {
        return false;
      }
    } else if (currentUser.organization_type === 'ngo') {
      if (currentUser.ngo?.toString() !== targetUser.ngo?.toString()) {
        return false;
      }
    }
  }

  // Role hierarchy check
  const roleHierarchy = {
    'admin': 10,
    'municipality_manager': 8,
    'municipality_user': 6,
    'ngo_manager': 8,
    'ngo_user': 6,
    'citizen': 1
  };

  const currentUserLevel = roleHierarchy[currentUser.role] || 0;
  const targetUserLevel = roleHierarchy[targetUser.role] || 0;

  return currentUserLevel > targetUserLevel;
};

// Check if user is organization admin
export const isOrganizationAdmin = (user) => {
  return ['municipality_manager', 'ngo_manager'].includes(user.role);
};

// Check if user is manager
export const isManager = (user) => {
  return user.role.includes('manager') || user.role === 'admin';
};

// Get user's role level
export const getUserRoleLevel = (role) => {
  const roleHierarchy = {
    'admin': 10,
    'municipality_manager': 8,
    'municipality_user': 6,
    'ngo_manager': 8,
    'ngo_user': 6,
    'citizen': 1
  };
  return roleHierarchy[role] || 0;
};

// Check if user can create a child with specific role
export const canCreateChildWithRole = (parentRole, childRole) => {
  const parentLevel = getUserRoleLevel(parentRole);
  const childLevel = getUserRoleLevel(childRole);
  
  return parentLevel > childLevel;
};

// Validate parent-child relationship
export const validateParentChild = async (parentId, childId, childRole) => {
  if (!parentId) return true;
  
  const parent = await User.findById(parentId);
  if (!parent) return false;
  
  return canCreateChildWithRole(parent.role, childRole);
};

// Get all children of a user
export const getUserChildren = async (userId) => {
  return await User.find({ parent_id: userId });
};

// Get all descendants of a user (recursive)
export const getUserDescendants = async (userId) => {
  const children = await getUserChildren(userId);
  let descendants = [...children];
  
  for (const child of children) {
    const childDescendants = await getUserDescendants(child._id);
    descendants = descendants.concat(childDescendants);
  }
  
  return descendants;
};
