import User from '../models/User.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Only admin can get all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Error handling utility
const handleError = (error, res) => {
  console.error('User Management Error:', error);

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists'
    });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      details: messages
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
};

// Get user hierarchy (children and descendants)
export const getUserHierarchy = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'children',
      select: '-password'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user can view this hierarchy
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      const canView = await req.user.canManage(userId) || await req.user.isDescendantOf(userId);
      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this user hierarchy'
        });
      }
    }

    const children = await user.getChildren('-password');
    const descendants = await user.getDescendants();

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          password: undefined
        },
        children: children.map(child => ({ ...child.toObject(), password: undefined })),
        totalDescendants: descendants.length
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};

// Add a user under another user (create parent-child relationship)
export const addSubUser = async (req, res) => {
  try {
    const { name, email, password, parentId, role, organizationName } = req.body;
    const currentUserId = req.user.id;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Use parentId from body or current user as parent
    const actualParentId = parentId || currentUserId;

    // Check if parent exists and validate relationship
    const parent = await User.findById(actualParentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent user not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      // Non-admin users can only add children under themselves or their descendants
      if (actualParentId !== currentUserId) {
        const canManage = await req.user.canManage(actualParentId);
        if (!canManage) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to add users under this parent'
          });
        }
      }
    }

    // Validate parent-child relationship with role
    const isValidRelationship = await User.validateParentChild(actualParentId, null, role);
    if (!isValidRelationship) {
      return res.status(400).json({
        success: false,
        message: `Invalid role hierarchy. ${parent.role} cannot have ${role} as child`
      });
    }

    // Check if parent can create child with this role
    if (!parent.canCreateChildWithRole(role)) {
      return res.status(400).json({
        success: false,
        message: `${parent.role} cannot create users with role ${role}`
      });
    }

    // Create the sub-user
    const subUser = await User.create({
      name,
      email,
      password,
      parent_id: actualParentId,
      role,
      organization_name: organizationName || parent.organization_name
    });

    // Remove password from response
    subUser.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Sub-user created successfully',
      data: {
        user: subUser
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};

// Move user to different parent
export const moveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newParentId } = req.body;

    // Find the user to move
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      const canManage = await req.user.canManage(userId);
      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to move this user'
        });
      }
    }

    // Validate new parent if provided
    if (newParentId) {
      const isValid = await User.validateParentChild(newParentId, userId, user.role);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent-child relationship for this role'
        });
      }

      const newParent = await User.findById(newParentId);
      if (!newParent) {
        return res.status(404).json({
          success: false,
          message: 'New parent user not found'
        });
      }

      if (!newParent.canCreateChildWithRole(user.role)) {
        return res.status(400).json({
          success: false,
          message: `${newParent.role} cannot have ${user.role} as child`
        });
      }
    }

    // Update the user
    user.parent_id = newParentId || null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User moved successfully',
      data: {
        user: {
          ...user.toObject(),
          password: undefined
        }
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};

// Get all users that current user can manage
export const getManagedUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === 'admin') {
      // Admins can see all users
      users = await User.find({}).select('-password').populate('parent', 'name email');
    } else {
      // Regular users can see themselves and their descendants
      const currentUser = await User.findById(req.user.id);
      const descendants = await currentUser.getDescendants();
      
      const userIds = [req.user.id, ...descendants.map(d => d._id)];
      users = await User.find({ _id: { $in: userIds } }).select('-password').populate('parent', 'name email');
    }

    res.status(200).json({
      success: true,
      data: {
        users: users,
        total: users.length
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};

// Remove user (and handle children)
export const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reassignTo } = req.body; // Optional: reassign children to another user

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      const canManage = await req.user.canManage(userId);
      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to remove this user'
        });
      }
    }

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Handle children
    const children = await user.getChildren();
    
    if (reassignTo) {
      // Validate reassign target
      const newParent = await User.findById(reassignTo);
      if (!newParent) {
        return res.status(404).json({
          success: false,
          message: 'Reassign target user not found'
        });
      }

      if (newParent.role === 'sub_user') {
        return res.status(400).json({
          success: false,
          message: 'Cannot reassign to a sub-user'
        });
      }

      // Reassign children
      await User.updateMany(
        { parent_id: userId },
        { parent_id: reassignTo }
      );
    } else {
      // Make children root users
      await User.updateMany(
        { parent_id: userId },
        { $unset: { parent_id: 1 }, $set: { role: 'user' } }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User removed successfully',
      data: {
        childrenAffected: children.length,
        reassignedTo: reassignTo || 'Made root users'
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};

// Get organization members
export const getOrganizationMembers = async (req, res) => {
  try {
    const { organizationType, organizationName } = req.query;
    
    // Check permissions
    if (req.user.role !== 'admin') {
      // Non-admin users can only see their own organization
      if (organizationType && organizationType !== req.user.organization_type) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own organization members'
        });
      }
    }

    const actualOrgType = organizationType || req.user.organization_type;
    const actualOrgName = organizationName || req.user.organization_name;

    const members = await User.findByOrganization(actualOrgType, actualOrgName);

    res.status(200).json({
      success: true,
      data: {
        members,
        organization_type: actualOrgType,
        organization_name: actualOrgName,
        total: members.length
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Check permissions
    if (req.user.role !== 'admin') {
      const allowedRoles = User.getRoleHierarchy()[req.user.role]?.children || [];
      if (!allowedRoles.includes(role) && role !== req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view users with this role'
        });
      }
    }

    const users = await User.findByRole(role);

    res.status(200).json({
      success: true,
      data: {
        users,
        role,
        total: users.length
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};

// Get role hierarchy
export const getRoleHierarchy = async (req, res) => {
  try {
    const hierarchy = User.getRoleHierarchy();
    
    // Filter based on user permissions
    let filteredHierarchy = hierarchy;
    
    if (req.user.role !== 'admin') {
      // Non-admin users only see their branch of the hierarchy
      const userOrgType = req.user.organization_type;
      filteredHierarchy = Object.fromEntries(
        Object.entries(hierarchy).filter(([role, info]) => 
          role === req.user.role || 
          info.organization === userOrgType ||
          (req.user.role === 'admin')
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {
        hierarchy: filteredHierarchy,
        current_user_role: req.user.role,
        current_user_level: req.user.getRoleLevel()
      }
    });

  } catch (error) {
    handleError(error, res);
  }
};
