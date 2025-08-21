import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true,
    maxlength: [100, 'Street cannot be longer than 100 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot be longer than 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot be longer than 50 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
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
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format. Must be [longitude, latitude]'
      }
    }
  }
});

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'NGO name cannot be longer than 100 characters']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Registration number cannot be longer than 50 characters']
  },
  type: {
    type: String,
    enum: [
      'charity',
      'foundation',
      'trust',
      'society',
      'section_8_company',
      'international_ngo',
      'community_based_org',
      'other'
    ],
    required: [true, 'NGO type is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  mission: {
    type: String,
    trim: true,
    maxlength: [500, 'Mission statement cannot be longer than 500 characters']
  },
  focusAreas: [{
    type: String,
    enum: [
      'animal_welfare',
      'child_protection',
      'disaster_relief',
      'education',
      'environment',
      'health',
      'human_rights',
      'poverty_alleviation',
      'women_empowerment',
      'rural_development',
      'urban_development',
      'elderly_care',
      'disability_support',
      'community_development',
      'other'
    ]
  }],
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot be longer than 20 characters']
    },
    alternatePhone: {
      type: String,
      trim: true,
      maxlength: [20, 'Alternate phone number cannot be longer than 20 characters']
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'Website URL cannot be longer than 200 characters'],
      match: [
        /^https?:\/\/.+/,
        'Please provide a valid website URL starting with http:// or https://'
      ]
    }
  },
  legalInfo: {
    registrationDate: {
      type: Date,
      required: [true, 'Registration date is required']
    },
    taxExemptionNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Tax exemption number cannot be longer than 50 characters']
    },
    fcraNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'FCRA number cannot be longer than 50 characters']
    },
    panNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'PAN number cannot be longer than 20 characters'],
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format']
    },
    gstNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'GST number cannot be longer than 20 characters'],
      uppercase: true
    }
  },
  operationalAreas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality'
  }],
  servicesOffered: [{
    type: String,
    trim: true,
    maxlength: [100, 'Service name cannot be longer than 100 characters']
  }],
  fundingSources: [{
    type: String,
    enum: [
      'government_grants',
      'private_donations',
      'corporate_csr',
      'international_funding',
      'membership_fees',
      'fundraising_events',
      'earned_revenue',
      'other'
    ]
  }],
  annualBudget: {
    type: Number,
    min: [0, 'Annual budget cannot be negative'],
    max: [100000000000, 'Annual budget seems too large'] // 100 billion limit
  },
  staffCount: {
    fullTime: {
      type: Number,
      min: [0, 'Staff count cannot be negative'],
      default: 0
    },
    partTime: {
      type: Number,
      min: [0, 'Staff count cannot be negative'],
      default: 0
    },
    volunteers: {
      type: Number,
      min: [0, 'Volunteer count cannot be negative'],
      default: 0
    }
  },
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Certification name cannot be longer than 100 characters']
    },
    issuedBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Issuing authority cannot be longer than 100 characters']
    },
    issuedDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    certificateNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Certificate number cannot be longer than 50 characters']
    }
  }],
  socialMediaLinks: {
    facebook: {
      type: String,
      trim: true,
      maxlength: [200, 'Facebook URL cannot be longer than 200 characters']
    },
    twitter: {
      type: String,
      trim: true,
      maxlength: [200, 'Twitter URL cannot be longer than 200 characters']
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: [200, 'Instagram URL cannot be longer than 200 characters']
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [200, 'LinkedIn URL cannot be longer than 200 characters']
    },
    youtube: {
      type: String,
      trim: true,
      maxlength: [200, 'YouTube URL cannot be longer than 200 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(value) {
        if (value) {
          const user = await mongoose.model('User').findById(value);
          return user && user.role === 'ngo_user';
        }
        return true;
      },
      message: 'Admin user must have ngo_user role'
    }
  },
  lastAuditDate: {
    type: Date
  },
  nextAuditDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ngoSchema.index({ name: 1 });
ngoSchema.index({ registrationNumber: 1 });
ngoSchema.index({ type: 1 });
ngoSchema.index({ focusAreas: 1 });
ngoSchema.index({ 'address.coordinates': '2dsphere' });
ngoSchema.index({ isActive: 1 });
ngoSchema.index({ isVerified: 1 });
ngoSchema.index({ operationalAreas: 1 });

// Virtual for getting all users in this NGO
ngoSchema.virtual('users', {
  ref: 'User',
  localField: 'name',
  foreignField: 'organization_name'
});

// Virtual for getting operational area details
ngoSchema.virtual('operationalAreaDetails', {
  ref: 'Municipality',
  localField: 'operationalAreas',
  foreignField: '_id'
});

// Ensure virtual fields are serialized
ngoSchema.set('toJSON', { virtuals: true });
ngoSchema.set('toObject', { virtuals: true });

// Pre-save middleware to set verification status
ngoSchema.pre('save', function(next) {
  if (this.isModified('isVerified') && this.isVerified && !this.verificationDate) {
    this.verificationDate = new Date();
  }
  next();
});

// Pre-save middleware to calculate next audit date
ngoSchema.pre('save', function(next) {
  if (this.isModified('lastAuditDate') && this.lastAuditDate) {
    // Set next audit date to 1 year from last audit
    this.nextAuditDate = new Date(this.lastAuditDate);
    this.nextAuditDate.setFullYear(this.nextAuditDate.getFullYear() + 1);
  }
  next();
});

// Instance method to get all users in this NGO
ngoSchema.methods.getUsers = function() {
  return mongoose.model('User').find({ 
    organization_type: 'ngo',
    organization_name: this.name 
  }).select('-password');
};

// Instance method to get NGO admin
ngoSchema.methods.getAdmin = function() {
  if (!this.adminUser) return null;
  return mongoose.model('User').findById(this.adminUser).select('-password');
};

// Instance method to check if NGO operates in a specific municipality
ngoSchema.methods.operatesInMunicipality = function(municipalityId) {
  return this.operationalAreas.some(area => 
    area.toString() === municipalityId.toString()
  );
};

// Instance method to add operational area
ngoSchema.methods.addOperationalArea = function(municipalityId) {
  if (!this.operatesInMunicipality(municipalityId)) {
    this.operationalAreas.push(municipalityId);
  }
  return this.save();
};

// Instance method to remove operational area
ngoSchema.methods.removeOperationalArea = function(municipalityId) {
  this.operationalAreas = this.operationalAreas.filter(area => 
    area.toString() !== municipalityId.toString()
  );
  return this.save();
};

// Instance method to check if certification is valid
ngoSchema.methods.hasCertification = function(certificationName) {
  return this.certifications.some(cert => {
    const isNameMatch = cert.name.toLowerCase().includes(certificationName.toLowerCase());
    const isNotExpired = !cert.expiryDate || cert.expiryDate > new Date();
    return isNameMatch && isNotExpired;
  });
};

// Instance method to get expired certifications
ngoSchema.methods.getExpiredCertifications = function() {
  const now = new Date();
  return this.certifications.filter(cert => 
    cert.expiryDate && cert.expiryDate <= now
  );
};

// Instance method to get certifications expiring soon (within 30 days)
ngoSchema.methods.getCertificationsExpiringSoon = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.certifications.filter(cert => 
    cert.expiryDate && 
    cert.expiryDate > new Date() && 
    cert.expiryDate <= futureDate
  );
};

// Instance method to calculate distance from a point
ngoSchema.methods.distanceFrom = function(longitude, latitude) {
  if (!this.address || !this.address.coordinates || !this.address.coordinates.coordinates) {
    return null;
  }
  
  const [ngoLng, ngoLat] = this.address.coordinates.coordinates;
  
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in kilometers
  const dLat = (latitude - ngoLat) * Math.PI / 180;
  const dLng = (longitude - ngoLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(ngoLat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Instance method to check if audit is due
ngoSchema.methods.isAuditDue = function() {
  if (!this.nextAuditDate) return false;
  return new Date() >= this.nextAuditDate;
};

// Instance method to get age of NGO
ngoSchema.methods.getAge = function() {
  if (!this.legalInfo || !this.legalInfo.registrationDate) return null;
  
  const now = new Date();
  const registrationDate = new Date(this.legalInfo.registrationDate);
  const diffTime = Math.abs(now - registrationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    days: diffDays,
    years: Math.floor(diffDays / 365),
    months: Math.floor((diffDays % 365) / 30)
  };
};

// Static method to find NGOs by focus area
ngoSchema.statics.findByFocusArea = function(focusArea) {
  return this.find({ 
    focusAreas: focusArea,
    isActive: true 
  });
};

// Static method to find NGOs near a point
ngoSchema.statics.findNear = function(longitude, latitude, maxDistance = 10000) {
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
  });
};

// Static method to find NGOs operating in a municipality
ngoSchema.statics.findByMunicipality = function(municipalityId) {
  return this.find({
    operationalAreas: municipalityId,
    isActive: true
  });
};

// Static method to search NGOs
ngoSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    isActive: true,
    ...options
  };
  
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { registrationNumber: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { mission: { $regex: query, $options: 'i' } },
      { 'address.city': { $regex: query, $options: 'i' } },
      { 'address.state': { $regex: query, $options: 'i' } },
      { servicesOffered: { $regex: query, $options: 'i' } }
    ];
  }
  
  return this.find(searchQuery);
};

// Static method to find NGOs with expiring certifications
ngoSchema.statics.findWithExpiringCertifications = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'certifications.expiryDate': {
      $gte: new Date(),
      $lte: futureDate
    },
    isActive: true
  });
};

// Static method to find NGOs needing audit
ngoSchema.statics.findNeedingAudit = function() {
  return this.find({
    $or: [
      { nextAuditDate: { $lte: new Date() } },
      { nextAuditDate: { $exists: false } },
      { lastAuditDate: { $exists: false } }
    ],
    isActive: true
  });
};

// Static method to get NGO statistics
ngoSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalNGOs: { $sum: 1 },
        activeNGOs: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedNGOs: { $sum: { $cond: ['$isVerified', 1, 0] } },
        totalStaff: { $sum: { $add: ['$staffCount.fullTime', '$staffCount.partTime'] } },
        totalVolunteers: { $sum: '$staffCount.volunteers' },
        totalBudget: { $sum: '$annualBudget' },
        avgBudget: { $avg: '$annualBudget' }
      }
    }
  ]);
};

const NGO = mongoose.model('NGO', ngoSchema);

export default NGO;
