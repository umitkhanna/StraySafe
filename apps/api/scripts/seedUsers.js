import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    console.log('Created Admin:', admin.email);

    // Create NGO Organization
    const ngoUser = await User.create({
      name: 'NGO User',
      email: 'ngo.user@example.com',
      password: 'password123',
      role: 'ngo_user',
      organization_name: 'Animal Welfare NGO'
    });
    console.log('Created NGO User:', ngoUser.email);

    const ngoManager = await User.create({
      name: 'NGO Manager',
      email: 'ngo.manager@example.com',
      password: 'password123',
      role: 'ngo_manager',
      organization_name: 'Animal Welfare NGO',
      parent_id: ngoUser._id
    });
    console.log('Created NGO Manager:', ngoManager.email);

    const ngoOperator = await User.create({
      name: 'NGO Operator',
      email: 'ngo.operator@example.com',
      password: 'password123',
      role: 'ngo_operator',
      organization_name: 'Animal Welfare NGO',
      parent_id: ngoManager._id
    });
    console.log('Created NGO Operator:', ngoOperator.email);

    const ngoGroundStaff = await User.create({
      name: 'NGO Ground Staff',
      email: 'ngo.staff@example.com',
      password: 'password123',
      role: 'ngo_ground_staff',
      organization_name: 'Animal Welfare NGO',
      parent_id: ngoManager._id
    });
    console.log('Created NGO Ground Staff:', ngoGroundStaff.email);

    // Create Municipality Organization
    const municipalityUser = await User.create({
      name: 'Municipality User',
      email: 'municipality.user@example.com',
      password: 'password123',
      role: 'municipality_user',
      organization_name: 'City Municipality'
    });
    console.log('Created Municipality User:', municipalityUser.email);

    const municipalityManager = await User.create({
      name: 'Municipality Manager',
      email: 'municipality.manager@example.com',
      password: 'password123',
      role: 'municipality_manager',
      organization_name: 'City Municipality',
      parent_id: municipalityUser._id
    });
    console.log('Created Municipality Manager:', municipalityManager.email);

    const municipalityOperator = await User.create({
      name: 'Municipality Operator',
      email: 'municipality.operator@example.com',
      password: 'password123',
      role: 'municipality_operator',
      organization_name: 'City Municipality',
      parent_id: municipalityManager._id
    });
    console.log('Created Municipality Operator:', municipalityOperator.email);

    const municipalityGroundStaff = await User.create({
      name: 'Municipality Ground Staff',
      email: 'municipality.staff@example.com',
      password: 'password123',
      role: 'municipality_ground_staff',
      organization_name: 'City Municipality',
      parent_id: municipalityManager._id
    });
    console.log('Created Municipality Ground Staff:', municipalityGroundStaff.email);

    // Create App Users
    const appUser = await User.create({
      name: 'App User',
      email: 'app.user@example.com',
      password: 'password123',
      role: 'app_user'
    });
    console.log('Created App User:', appUser.email);

    const citizen1 = await User.create({
      name: 'John Citizen',
      email: 'john@example.com',
      password: 'password123',
      role: 'citizen',
      parent_id: appUser._id
    });
    console.log('Created Citizen:', citizen1.email);

    const citizen2 = await User.create({
      name: 'Jane Citizen',
      email: 'jane@example.com',
      password: 'password123',
      role: 'citizen',
      parent_id: appUser._id
    });
    console.log('Created Citizen:', citizen2.email);

    const highriskUser = await User.create({
      name: 'High Risk Area User',
      email: 'highrisk@example.com',
      password: 'password123',
      role: 'highrisk_area_user',
      parent_id: appUser._id
    });
    console.log('Created High Risk Area User:', highriskUser.email);

    console.log('\n✅ Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('NGO User: ngo.user@example.com / password123');
    console.log('NGO Manager: ngo.manager@example.com / password123');
    console.log('NGO Operator: ngo.operator@example.com / password123');
    console.log('NGO Ground Staff: ngo.staff@example.com / password123');
    console.log('Municipality User: municipality.user@example.com / password123');
    console.log('Municipality Manager: municipality.manager@example.com / password123');
    console.log('Municipality Operator: municipality.operator@example.com / password123');
    console.log('Municipality Ground Staff: municipality.staff@example.com / password123');
    console.log('App User: app.user@example.com / password123');
    console.log('Citizen 1: john@example.com / password123');
    console.log('Citizen 2: jane@example.com / password123');
    console.log('High Risk User: highrisk@example.com / password123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    process.exit();
  }
};

// Run the seed script
const runSeed = async () => {
  await connectDB();
  await seedUsers();
};

runSeed();
