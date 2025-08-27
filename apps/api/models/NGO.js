import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    trim: true,
    maxlength: [100, 'NGO name cannot be longer than 100 characters']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    trim: true,
    maxlength: [50, 'Registration number cannot be longer than 50 characters']
  },
  category: {
    type: String,
    enum: [
      'Animal Welfare',
      'Child Protection',
      'Education',
      'Environment',
      'Health',
      'Human Rights',
      'Community Development',
      'Other'
    ],
    required: [true, 'NGO category is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
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
ngoSchema.index({ name: 1 });
ngoSchema.index({ registrationNumber: 1 });
ngoSchema.index({ category: 1 });
ngoSchema.index({ isActive: 1 });

const NGO = mongoose.model('NGO', ngoSchema);

export default NGO;
