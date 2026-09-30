const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Resource = require('./models/Resource');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

// Verify MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is not defined in .env file!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected successfully to Atlas!');
    
    const defaultResources = [
      { name: 'CSE Lab 1', type: 'Lab', location: 'CSE Block 1st Floor', description: '60 Systems, High Speed Internet' },
      { name: 'CSE Lab 2 (AI & ML Lab)', type: 'Lab', location: 'CSE Block 2nd Floor', description: 'GPU Enabled High End Workstations' },
      { name: 'ECE Embedded Lab', type: 'Lab', location: 'ECE Block Ground Floor', description: 'Microcontroller & IoT Kits' },
      { name: 'Central Seminar Hall', type: 'Seminar Hall', location: 'Main Building 3rd Floor', description: 'Capacity 250, Projector & Sound System' },
      { name: 'Main Campus Auditorium', type: 'Auditorium', location: 'Amenities Block', description: 'Capacity 1000, Stage Lighting & AC' }
    ];

    // Clear old resources and insert new ones
    await Resource.deleteMany({});
    await Resource.insertMany(defaultResources);
    console.log('✅ Resources added successfully to DB!');

    // Create Default Admin User
    const hashedPassword = await bcrypt.hash('123', 10);
    
    await User.deleteMany({ email: 'testadmin@gmail.com' }); 
    await User.create({
      name: 'Test Admin',
      email: 'testadmin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      department: 'Administration'
    });
    
    console.log('✅ Default Admin user (testadmin@gmail.com) created successfully!');

    process.exit();
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
  });