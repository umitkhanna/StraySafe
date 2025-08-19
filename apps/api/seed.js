import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');
    
    // Connect to database
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');

    // Create a test regular user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'user'
    });

    console.log('Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: test123');

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
