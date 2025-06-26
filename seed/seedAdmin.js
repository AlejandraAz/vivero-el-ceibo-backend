import sequelize from '../config/connection.js';
import Admin from '../models/Admin.js';

const seedAdmin = async () => {
  try {
    await sequelize.sync(); // sincroniza tablas 

    const existingAdmin = await Admin.findOne({ where: { email: 'admin@elceibo.com' } });

    if (existingAdmin) {
      console.log('✔️ Admin already exists. Skipping seed.');
      return;
    }

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@elceibo.com',
      password: 'admin1234' 
    });

    console.log('✅ Admin created successfully:', admin.name);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Connection closed.');
  }
};

seedAdmin();

export default seedAdmin;
