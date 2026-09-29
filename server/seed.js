const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Resource = require('./models/Resource');

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

    await Resource.deleteMany({}); // Purana data clear panna
    await Resource.insertMany(defaultResources);
    
    console.log('✅ Resources added successfully to DB!');
    process.exit();
  })
  .catch(err => {
    console.error('Error seeding resources:', err);
    process.exit(1);
  });