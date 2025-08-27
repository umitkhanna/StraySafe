import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be longer than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: [
      'admin',
      'ngo_user',
      'ngo_manager',
      'ngo_operator', 
      'ngo_ground_staff',
      'municipality_user',
      'municipality_manager',
      'municipality_operator',
      'municipality_ground_staff',
      'app_user',
      'citizen',
      'highrisk_area_user'
    ],
    default: 'citizen'
  },
  organization_type: {
    type: String,
    enum: ['ngo', 'municipality', 'app', null],
    default: null
  },
  organization_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Organization name cannot be longer than 100 characters']
  },
  municipality: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality',
    validate: {
      validator: async function(value) {
        if (value && this.organization_type === 'municipality') {
          const municipality = await mongoose.model('Municipality').findById(value);
          return municipality && municipality.isActive;
        }
        return !value || this.organization_type !== 'municipality';
      },
      message: 'Invalid municipality reference'
    }
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    validate: {
      validator: async function(value) {
        if (value && this.organization_type === 'ngo') {
          const ngo = await mongoose.model('NGO').findById(value);
          return ngo && ngo.isActive;
        }
        return !value || this.organization_type !== 'ngo';
      },
      message: 'Invalid NGO reference'
    }
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street cannot be longer than 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot be longer than 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot be longer than 50 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot be longer than 50 characters']
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Postal code cannot be longer than 20 characters']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(coords) {
            // Allow empty/undefined coordinates
            if (!coords || coords.length === 0) return true;
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && // longitude
                   coords[1] >= -90 && coords[1] <= 90;     // latitude
          },
          message: 'Invalid coordinates format. Must be [longitude, latitude]'
        }
      }
    }
  },
  geofence: {
    type: {
      type: String,
      enum: ['Polygon', 'Circle'],
      default: 'Circle'
    },
    center: {
      type: [Number], // [longitude, latitude] for circle center
      validate: {
        validator: function(coords) {
          if (!coords || coords.length === 0) return true;
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid center coordinates format. Must be [longitude, latitude]'
      }
    },
    radius: {
      type: Number, // radius in meters for circle geofence
      min: [1, 'Radius must be at least 1 meter'],
      max: [50000, 'Radius cannot exceed 50 kilometers']
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON Polygon coordinates for polygon geofence
      validate: {
        validator: function(coords) {
          if (!coords || coords.length === 0) return true;
          return Array.isArray(coords) && coords.length > 0;
        },
        message: 'Invalid geofence coordinates format'
      }
    },
    isActive: {
      type: Boolean,
      default: false
    },
    alertContacts: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Contact name cannot be longer than 50 characters']
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: [20, 'Phone number cannot be longer than 20 characters']
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email'
        ]
      },
      relationship: {
        type: String,
        enum: ['family', 'friend', 'caregiver', 'emergency_contact', 'other'],
        default: 'emergency_contact'
      }
    }]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Emergency contact name cannot be longer than 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Emergency contact phone cannot be longer than 20 characters']
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot be longer than 50 characters']
    }
  },
  medicalInfo: {
    conditions: [{
      type: String,
      trim: true,
      maxlength: [100, 'Medical condition cannot be longer than 100 characters']
    }],
    medications: [{
      type: String,
      trim: true,
      maxlength: [100, 'Medication cannot be longer than 100 characters']
    }],
    allergies: [{
      type: String,
      trim: true,
      maxlength: [100, 'Allergy cannot be longer than 100 characters']
    }],
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Medical notes cannot be longer than 500 characters']
    }
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  profilePicture: {
    type: String,
    trim: true,
    maxlength: [500, 'Profile picture URL cannot be longer than 500 characters']
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    validate: {
      validator: async function(value) {
        // If parent_id is set, ensure the parent exists and has appropriate role
        if (value) {
          const parent = await mongoose.model('User').findById(value);
          if (!parent) return false;
          
          // Role hierarchy validation
          const roleHierarchy = {
            'admin': ['ngo_user', 'municipality_user', 'app_user'],
            'ngo_user': ['ngo_manager', 'ngo_operator', 'ngo_ground_staff'],
            'ngo_manager': ['ngo_operator', 'ngo_ground_staff'],
            'municipality_user': ['municipality_manager', 'municipality_operator', 'municipality_ground_staff'],
            'municipality_manager': ['municipality_operator', 'municipality_ground_staff'],
            'app_user': ['citizen', 'highrisk_area_user']
          };
          
          // Check if parent can have this child role
          const allowedChildRoles = roleHierarchy[parent.role] || [];
          if (!allowedChildRoles.includes(this.role)) {
            return false;
          }
          
          // Prevent self-referencing
          if (parent._id.toString() === this._id.toString()) return false;
          
          // Prevent circular references
          if (parent.parent_id && parent.parent_id.toString() === this._id.toString()) return false;
        }
        return true;
      },
      message: 'Invalid parent user for this role'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ parent_id: 1 });
userSchema.index({ role: 1 });
userSchema.index({ municipality: 1 });
userSchema.index({ ngo: 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ riskLevel: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ organization_type: 1, organization_name: 1 });

// Virtual for getting child users
userSchema.virtual('children', {
  ref: 'User',
  localField: '_id',
  foreignField: 'parent_id'
});

// Virtual for getting parent user
userSchema.virtual('parent', {
  ref: 'User',
  localField: 'parent_id',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  next();
});

// Pre-save middleware to handle parent-child relationships and organization types
userSchema.pre('save', function(next) {
  // Set organization_type based on role
  if (this.role.startsWith('ngo_')) {
    this.organization_type = 'ngo';
  } else if (this.role.startsWith('municipality_')) {
    this.organization_type = 'municipality';
  } else if (['citizen', 'highrisk_area_user', 'app_user'].includes(this.role)) {
    this.organization_type = 'app';
  } else if (this.role === 'admin') {
    this.organization_type = null;
  }
  
  next();
});

// Pre-remove middleware to handle cascading deletes
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // When a user is deleted, reassign their children to null parent or promote them
    const children = await mongoose.model('User').find({ parent_id: this._id });
    
    for (const child of children) {
      // Promote child to appropriate independent role
      if (child.role.includes('ground_staff') || child.role.includes('operator')) {
        // Make them independent users in their organization
        if (child.organization_type === 'ngo') {
          child.role = 'ngo_user';
        } else if (child.organization_type === 'municipality') {
          child.role = 'municipality_user';
        } else if (child.organization_type === 'app') {
          child.role = 'app_user';
        }
      }
      child.parent_id = null;
      await child.save();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to get all child users
userSchema.methods.getChildren = function(populateFields = '') {
  return mongoose.model('User').find({ parent_id: this._id }).populate(populateFields);
};

// Instance method to get all descendant users (children and their children)
userSchema.methods.getDescendants = async function() {
  const descendants = [];
  const children = await this.getChildren();
  
  for (const child of children) {
    descendants.push(child);
    const childDescendants = await child.getDescendants();
    descendants.push(...childDescendants);
  }
  
  return descendants;
};

// Instance method to get parent user
userSchema.methods.getParent = function(populateFields = '') {
  if (!this.parent_id) return null;
  return mongoose.model('User').findById(this.parent_id).populate(populateFields);
};

// Instance method to get all ancestors (parent, grandparent, etc.)
userSchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent_id) {
    const parent = await mongoose.model('User').findById(current.parent_id);
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }
  
  return ancestors;
};

// Instance method to check if user can manage another user
userSchema.methods.canManage = function(targetUserId) {
  // Admins can manage anyone
  if (this.role === 'admin') return true;
  
  // Organization leaders can manage their organization members
  const leaderRoles = ['ngo_user', 'ngo_manager', 'municipality_user', 'municipality_manager', 'app_user'];
  if (leaderRoles.includes(this.role)) {
    return this.getChildren().then(children => 
      children.some(child => child._id.toString() === targetUserId.toString())
    );
  }
  
  // Managers can manage their direct reports
  const managerRoles = ['ngo_manager', 'municipality_manager'];
  if (managerRoles.includes(this.role)) {
    return this.getChildren().then(children => 
      children.some(child => child._id.toString() === targetUserId.toString())
    );
  }
  
  return false;
};

// Instance method to get role hierarchy level
userSchema.methods.getRoleLevel = function() {
  const roleLevels = {
    'admin': 0,
    'ngo_user': 1,
    'municipality_user': 1,
    'app_user': 1,
    'ngo_manager': 2,
    'municipality_manager': 2,
    'ngo_operator': 3,
    'municipality_operator': 3,
    'ngo_ground_staff': 4,
    'municipality_ground_staff': 4,
    'citizen': 2,
    'highrisk_area_user': 2
  };
  
  return roleLevels[this.role] || 99;
};

// Instance method to check if user can create child with specific role
userSchema.methods.canCreateChildWithRole = function(childRole) {
  const roleHierarchy = {
    'admin': ['ngo_user', 'municipality_user', 'app_user'],
    'ngo_user': ['ngo_manager', 'ngo_operator', 'ngo_ground_staff'],
    'ngo_manager': ['ngo_operator', 'ngo_ground_staff'],
    'municipality_user': ['municipality_manager', 'municipality_operator', 'municipality_ground_staff'],
    'municipality_manager': ['municipality_operator', 'municipality_ground_staff'],
    'app_user': ['citizen', 'highrisk_area_user']
  };
  
  const allowedChildRoles = roleHierarchy[this.role] || [];
  return allowedChildRoles.includes(childRole);
};

// Instance method to get organization members
userSchema.methods.getOrganizationMembers = async function() {
  if (!this.organization_type) return [];
  
  // Get all users in the same organization
  const query = { organization_type: this.organization_type };
  
  // If this user has an organization_name, filter by it
  if (this.organization_name) {
    query.organization_name = this.organization_name;
  }
  
  return mongoose.model('User').find(query).select('-password');
};

// Instance method to check if user is organization admin
userSchema.methods.isOrganizationAdmin = function() {
  return ['ngo_user', 'municipality_user', 'app_user'].includes(this.role);
};

// Instance method to check if user is manager
userSchema.methods.isManager = function() {
  return ['ngo_manager', 'municipality_manager'].includes(this.role);
};

// Instance method to check if user is ground level
userSchema.methods.isGroundLevel = function() {
  return ['ngo_ground_staff', 'municipality_ground_staff', 'ngo_operator', 'municipality_operator', 'citizen', 'highrisk_area_user'].includes(this.role);
};

// Instance method to check if user is a descendant of another user
userSchema.methods.isDescendantOf = async function(parentUserId) {
  const ancestors = await this.getAncestors();
  return ancestors.some(ancestor => ancestor._id.toString() === parentUserId.toString());
};

// Instance method to check if user is within geofence
userSchema.methods.isWithinGeofence = function(longitude, latitude) {
  if (!this.geofence || !this.geofence.isActive) {
    return true; // No geofence or inactive geofence means no restriction
  }
  
  if (this.geofence.type === 'Circle') {
    if (!this.geofence.center || !this.geofence.radius) return true;
    
    const [centerLng, centerLat] = this.geofence.center;
    const distance = this.calculateDistance(longitude, latitude, centerLng, centerLat);
    return distance <= this.geofence.radius;
  }
  
  if (this.geofence.type === 'Polygon') {
    // This would typically use MongoDB's $geoWithin operator
    // For now, return true (implementation would require point-in-polygon algorithm)
    return true;
  }
  
  return true;
};

// Instance method to calculate distance between two points
userSchema.methods.calculateDistance = function(lng1, lat1, lng2, lat2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
};

// Instance method to update geofence
userSchema.methods.updateGeofence = function(geofenceData) {
  if (this.role !== 'highrisk_area_user') {
    throw new Error('Geofence can only be set for high-risk area users');
  }
  
  this.geofence = {
    ...this.geofence,
    ...geofenceData
  };
  
  return this.save();
};

// Instance method to add alert contact
userSchema.methods.addAlertContact = function(contactData) {
  if (this.role !== 'highrisk_area_user') {
    throw new Error('Alert contacts can only be added for high-risk area users');
  }
  
  this.geofence.alertContacts.push(contactData);
  return this.save();
};

// Instance method to remove alert contact
userSchema.methods.removeAlertContact = function(contactId) {
  if (this.role !== 'highrisk_area_user') {
    throw new Error('Alert contacts can only be managed for high-risk area users');
  }
  
  this.geofence.alertContacts = this.geofence.alertContacts.filter(
    contact => contact._id.toString() !== contactId.toString()
  );
  return this.save();
};

// Instance method to get municipality details
userSchema.methods.getMunicipalityDetails = function() {
  if (!this.municipality) return null;
  return mongoose.model('Municipality').findById(this.municipality);
};

// Instance method to get NGO details
userSchema.methods.getNGODetails = function() {
  if (!this.ngo) return null;
  return mongoose.model('NGO').findById(this.ngo);
};

// Instance method to check if address is complete
userSchema.methods.hasCompleteAddress = function() {
  return this.address && 
         this.address.street && 
         this.address.city && 
         this.address.state && 
         this.address.country;
};

// Instance method to check if user needs geofence setup
userSchema.methods.needsGeofenceSetup = function() {
  return this.role === 'highrisk_area_user' && 
         (!this.geofence || !this.geofence.isActive);
};

// Static method to find user by email with password
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email }).select('+password');
};

// Static method to find all root users (users without parents)
userSchema.statics.findRootUsers = function() {
  return this.find({ parent_id: null });
};

// Static method to find all users under a specific parent
userSchema.statics.findByParent = function(parentId, includeDescendants = false) {
  if (includeDescendants) {
    // This would require a recursive query - implemented in the controller
    return this.find({ parent_id: parentId });
  }
  return this.find({ parent_id: parentId });
};

// Static method to build user hierarchy tree
userSchema.statics.buildHierarchy = async function(rootUserId = null) {
  const users = await this.find({ parent_id: rootUserId }).populate('children');
  
  for (const user of users) {
    user.children = await this.buildHierarchy(user._id);
  }
  
  return users;
};

// Static method to validate parent-child relationship
userSchema.statics.validateParentChild = async function(parentId, childId, childRole) {
  if (!parentId || !childRole) return false;
  
  const parent = await this.findById(parentId);
  if (!parent) return false;
  
  // Check if parent can create child with this role
  if (!parent.canCreateChildWithRole(childRole)) return false;
  
  // If childId is provided (for existing user), check circular references
  if (childId) {
    const child = await this.findById(childId);
    if (!child) return false;
    
    // Prevent self-referencing
    if (parentId.toString() === childId.toString()) return false;
    
    // Prevent circular references
    const childAncestors = await child.getAncestors();
    return !childAncestors.some(ancestor => ancestor._id.toString() === parentId.toString());
  }
  
  return true;
};

// Static method to find users by organization
userSchema.statics.findByOrganization = function(organizationType, organizationName = null) {
  const query = { organization_type: organizationType };
  if (organizationName) {
    query.organization_name = organizationName;
  }
  return this.find(query).select('-password');
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role }).select('-password');
};

// Static method to find high-risk users without geofence
userSchema.statics.findHighRiskUsersWithoutGeofence = function() {
  return this.find({
    role: 'highrisk_area_user',
    $or: [
      { 'geofence.isActive': false },
      { geofence: { $exists: false } }
    ],
    isActive: true
  }).select('-password');
};

// Static method to find users by location
userSchema.statics.findNear = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isActive: true
  }).select('-password');
};

// Static method to find users by municipality
userSchema.statics.findByMunicipality = function(municipalityId) {
  return this.find({
    municipality: municipalityId,
    isActive: true
  }).select('-password');
};

// Static method to find users by NGO
userSchema.statics.findByNGO = function(ngoId) {
  return this.find({
    ngo: ngoId,
    isActive: true
  }).select('-password');
};

// Static method to find users by risk level
userSchema.statics.findByRiskLevel = function(riskLevel) {
  return this.find({
    riskLevel: riskLevel,
    isActive: true
  }).select('-password');
};

// Static method to search users with enhanced criteria
userSchema.statics.searchUsers = function(query, options = {}) {
  const searchQuery = {
    isActive: true,
    ...options
  };
  
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } },
      { 'address.city': { $regex: query, $options: 'i' } },
      { 'address.state': { $regex: query, $options: 'i' } },
      { organization_name: { $regex: query, $options: 'i' } }
    ];
  }
  
  return this.find(searchQuery).select('-password');
};

// Static method to get role hierarchy
userSchema.statics.getRoleHierarchy = function() {
  return {
    'admin': {
      level: 0,
      children: ['ngo_user', 'municipality_user', 'app_user'],
      description: 'System Administrator'
    },
    'ngo_user': {
      level: 1,
      children: ['ngo_manager', 'ngo_operator', 'ngo_ground_staff'],
      description: 'NGO Organization Admin',
      organization: 'ngo'
    },
    'ngo_manager': {
      level: 2,
      children: ['ngo_operator', 'ngo_ground_staff'],
      description: 'NGO Manager',
      organization: 'ngo'
    },
    'ngo_operator': {
      level: 3,
      children: [],
      description: 'NGO Operator',
      organization: 'ngo'
    },
    'ngo_ground_staff': {
      level: 4,
      children: [],
      description: 'NGO Ground Staff',
      organization: 'ngo'
    },
    'municipality_user': {
      level: 1,
      children: ['municipality_manager', 'municipality_operator', 'municipality_ground_staff'],
      description: 'Municipality Organization Admin',
      organization: 'municipality'
    },
    'municipality_manager': {
      level: 2,
      children: ['municipality_operator', 'municipality_ground_staff'],
      description: 'Municipality Manager',
      organization: 'municipality'
    },
    'municipality_operator': {
      level: 3,
      children: [],
      description: 'Municipality Operator',
      organization: 'municipality'
    },
    'municipality_ground_staff': {
      level: 4,
      children: [],
      description: 'Municipality Ground Staff',
      organization: 'municipality'
    },
    'app_user': {
      level: 1,
      children: ['citizen', 'highrisk_area_user'],
      description: 'App Organization Admin',
      organization: 'app'
    },
    'citizen': {
      level: 2,
      children: [],
      description: 'Regular Citizen',
      organization: 'app'
    },
    'highrisk_area_user': {
      level: 2,
      children: [],
      description: 'High Risk Area User',
      organization: 'app'
    }
  };
};

// Pre-save middleware to handle GeoJSON structure
userSchema.pre('save', function(next) {
  // Handle address coordinates
  if (this.address && this.address.coordinates) {
    // If coordinates object exists but coordinates array is empty/undefined, remove the whole coordinates object
    if (!this.address.coordinates.coordinates || this.address.coordinates.coordinates.length === 0) {
      this.address.coordinates = undefined;
    } else {
      // Ensure type is set if coordinates array exists
      if (!this.address.coordinates.type) {
        this.address.coordinates.type = 'Point';
      }
    }
  }

  // Handle geofence structure
  if (this.geofence) {
    // Ensure required arrays exist and are properly initialized
    if (!this.geofence.center) {
      this.geofence.center = [];
    }
    if (!this.geofence.coordinates) {
      this.geofence.coordinates = [];
    }
    if (!this.geofence.alertContacts) {
      this.geofence.alertContacts = [];
    }
    if (this.geofence.isActive === undefined) {
      this.geofence.isActive = false;
    }
  }

  next();
});

const User = mongoose.model('User', userSchema);

export default User;
