import mongoose from 'mongoose';

const municipalitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Municipality name is required'],
    trim: true,
    maxlength: [100, 'Municipality name cannot be longer than 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India'
  },
  populationData: {
    totalPopulation: {
      type: Number,
      min: [0, 'Population cannot be negative']
    },
    urbanPopulation: {
      type: Number,
      min: [0, 'Urban population cannot be negative']
    },
    ruralPopulation: {
      type: Number,
      min: [0, 'Rural population cannot be negative']
    },
    lastCensusYear: {
      type: Number,
      min: [1900, 'Census year must be after 1900'],
      max: [new Date().getFullYear(), 'Census year cannot be in the future']
    }
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    },
    address: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminUser: {
    type: String,
    required: [true, 'Admin user is required']
  }
}, {
  timestamps: true
});

// Basic indexes for search performance
municipalitySchema.index({ name: 1 });
municipalitySchema.index({ state: 1 });
municipalitySchema.index({ isActive: 1 });

const Municipality = mongoose.model('Municipality', municipalitySchema);

export default Municipality;
