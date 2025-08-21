import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixGeoJSONStructure() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Find all users with invalid GeoJSON structure
    const usersWithInvalidGeoJSON = await User.find({
      $or: [
        { 'address.coordinates.coordinates': { $exists: false } },
        { 'address.coordinates.coordinates': { $size: 0 } },
        { 'address.coordinates.type': { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithInvalidGeoJSON.length} users with invalid GeoJSON structure`);

    for (const user of usersWithInvalidGeoJSON) {
      console.log(`Fixing user: ${user.name} (${user.email})`);
      
      // Fix address coordinates if they exist but are malformed
      if (user.address && user.address.coordinates) {
        if (!user.address.coordinates.coordinates || user.address.coordinates.coordinates.length === 0) {
          // Remove the invalid coordinates field entirely
          user.address.coordinates = undefined;
          user.markModified('address.coordinates');
        }
      }

      // Fix geofence structure if needed
      if (user.geofence) {
        // Ensure geofence has proper default values
        if (!user.geofence.center || user.geofence.center.length === 0) {
          user.geofence.center = [];
        }
        if (!user.geofence.coordinates || user.geofence.coordinates.length === 0) {
          user.geofence.coordinates = [];
        }
        if (!user.geofence.alertContacts) {
          user.geofence.alertContacts = [];
        }
        if (user.geofence.isActive === undefined) {
          user.geofence.isActive = false;
        }
        user.markModified('geofence');
      }

      // Save the user without validation to fix the structure
      await user.save({ validateBeforeSave: false });
      console.log(`Fixed user: ${user.name}`);
    }

    console.log('GeoJSON structure fix completed');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error fixing GeoJSON structure:', error);
    process.exit(1);
  }
}

// Run the fix
fixGeoJSONStructure();
