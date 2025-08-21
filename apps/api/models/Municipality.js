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

const municipalitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Municipality name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Municipality name cannot be longer than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Municipality code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Municipality code cannot be longer than 20 characters'],
    match: [/^[A-Z0-9_]+$/, 'Municipality code can only contain uppercase letters, numbers, and underscores']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be longer than 500 characters']
  },
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
      trim: true,
      maxlength: [20, 'Phone number cannot be longer than 20 characters']
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
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON Polygon/MultiPolygon coordinates
      validate: {
        validator: function(coords) {
          // Basic validation for polygon coordinates
          return Array.isArray(coords) && coords.length > 0;
        },
        message: 'Invalid boundary coordinates format'
      }
    }
  },
  populationSize: {
    type: Number,
    min: [0, 'Population size cannot be negative'],
    max: [50000000, 'Population size seems too large']
  },
  area: {
    type: Number, // in square kilometers
    min: [0, 'Area cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(value) {
        if (value) {
          const user = await mongoose.model('User').findById(value);
          return user && user.role === 'municipality_user';
        }
        return true;
      },
      message: 'Admin user must have municipality_user role'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
municipalitySchema.index({ name: 1 });
municipalitySchema.index({ code: 1 });
municipalitySchema.index({ 'address.coordinates': '2dsphere' });
municipalitySchema.index({ boundaries: '2dsphere' });
municipalitySchema.index({ isActive: 1 });

// Virtual for getting all users in this municipality
municipalitySchema.virtual('users', {
  ref: 'User',
  localField: 'name',
  foreignField: 'organization_name'
});

// Ensure virtual fields are serialized
municipalitySchema.set('toJSON', { virtuals: true });
municipalitySchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure coordinates are valid
municipalitySchema.pre('save', function(next) {
  // Set default coordinates index for GeoJSON
  if (this.address && this.address.coordinates && this.address.coordinates.coordinates) {
    this.address.coordinates.index = '2dsphere';
  }
  if (this.boundaries && this.boundaries.coordinates) {
    this.boundaries.index = '2dsphere';
  }
  next();
});

// Instance method to check if a point is within municipality boundaries
municipalitySchema.methods.containsPoint = function(longitude, latitude) {
  if (!this.boundaries || !this.boundaries.coordinates) {
    return false;
  }
  
  // This would typically use MongoDB's $geoWithin operator
  // For now, return a promise that resolves to the query result
  return mongoose.model('Municipality').findOne({
    _id: this._id,
    boundaries: {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }
    }
  }).then(result => !!result);
};

// Instance method to get all users in this municipality
municipalitySchema.methods.getUsers = function() {
  return mongoose.model('User').find({ 
    organization_type: 'municipality',
    organization_name: this.name 
  }).select('-password');
};

// Instance method to get municipality admin
municipalitySchema.methods.getAdmin = function() {
  if (!this.adminUser) return null;
  return mongoose.model('User').findById(this.adminUser).select('-password');
};

// Instance method to calculate distance from a point
municipalitySchema.methods.distanceFrom = function(longitude, latitude) {
  if (!this.address || !this.address.coordinates || !this.address.coordinates.coordinates) {
    return null;
  }
  
  const [muniLng, muniLat] = this.address.coordinates.coordinates;
  
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in kilometers
  const dLat = (latitude - muniLat) * Math.PI / 180;
  const dLng = (longitude - muniLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(muniLat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Static method to find municipality by coordinates
municipalitySchema.statics.findByCoordinates = function(longitude, latitude) {
  return this.findOne({
    boundaries: {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }
    },
    isActive: true
  });
};

// Static method to find municipalities near a point
municipalitySchema.statics.findNear = function(longitude, latitude, maxDistance = 10000) {
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

// Static method to search municipalities
municipalitySchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    isActive: true,
    ...options
  };
  
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { code: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { 'address.city': { $regex: query, $options: 'i' } },
      { 'address.state': { $regex: query, $options: 'i' } }
    ];
  }
  
  return this.find(searchQuery);
};

const Municipality = mongoose.model('Municipality', municipalitySchema);

export default Municipality;
