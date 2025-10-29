import sequelize from '../config/connection.js';
import Admin from '../models/Admin.js';


const seedAdmin = async () => {
  try {
    await sequelize.sync();

    const existingAdmin = await Admin.findOne({ where: { email: 'admin@elceibo.com' } });

    if (existingAdmin) {
      // Si existe, actualizar la contraseña
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin already exists, password updated.');
      return;
    }

    // Creamos el admin sin hashear la contraseña; el hook beforeCreate lo hará
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@elceibo.com',
      password: 'admin1234', // <-- texto plano, se hashea automáticamente
      rol: 'admin'
    });

    console.log('Admin created successfully:', admin.name);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await sequelize.close();
    console.log('Connection closed.');
  }
};

seedAdmin();

export default seedAdmin;
