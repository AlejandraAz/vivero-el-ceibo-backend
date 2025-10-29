import Customer from "../models/Customer.js";
import { fn, col, literal } from "sequelize";
import uploadToCloudinary from "../helpers/cloudinaryUpload.js";
import deleteFromCloudinary from "../helpers/cloudinaryDelete.js";
import Order from "../models/Order.js";
import Shipping from "../models/Shipping.js";
import Product from "../models/Product.js";
import {sendWelcomeEmail} from "../config/mailer.js";

const getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                status: 404,
                message: `Customer with ID ${id} not found.`
            })
        }
        return res.status(200).json({
            status: 200,
            message: `Customer ${customer.name}  retrieved successfully.`,
            customer
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        })
    }
};

const createCustomer = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 400,
                message: 'Name, email, and password are required.'
            })
        }
        if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100) {
            return res.status(400).json({
                status: 400,
                message: 'Name must be between 3 and 100 characters.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid email format.'
            });
        }

        const existingCustomer = await Customer.findOne({ where: { email } });

        if (existingCustomer) {
            return res.status(409).json({
                status: 409,
                message: 'Email already exists.'
            });
        }

        if (password.length < 8 || password.length > 15) {
            return res.status(400).json({
                status: 400,
                message: 'Password must be between 8 and 15 characters.'
            });
        }

        const customer = await Customer.create({ name, email, password });
        await sendWelcomeEmail(customer.email,customer.name);
        return res.status(201).json({
            status: 201,
            message: 'Customer created',
            customer
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'error internal server',
            error: error.message
        })
    }
};

// para registrarse 
const registerCustomer = async (req, res) => {
    const { name, email, password,phone, street, streetNumber, city, neighborhood, postalCode} = req.body;

    try {
        const existingCustomer = await Customer.findOne({ where: { email } });

        if (existingCustomer) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        const customer = await Customer.create({ name, email, password,phone,street,streetNumber,city,neighborhood,postalCode });

        return res.status(201).json({
            message: 'Cuenta creada correctamente',
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
};

const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, accountStatus, sessionStatus,phone, street, streetNumber, city, neighborhood, postalCode } = req.body;

    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({
                status: 404,
                message: 'Customer not found.'
            });
        }

        if (email && email !== customer.email) {
            const existing = await Customer.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({
                    status: 409,
                    message: 'Email is already in use by another customer.'
                });
            }
        }

        if (name && (name.length < 3 || name.length > 100)) {
            return res.status(400).json({
                status: 400,
                message: 'Name must be between 3 and 100 characters.'
            });
        }

        if (password && (password.length < 8 || password.length > 15)) {
            return res.status(400).json({
                status: 400,
                message: 'Password must be between 8 and 15 characters.'
            });
        }


        await customer.update({ name, email, password, accountStatus, sessionStatus,phone, street, streetNumber, city, neighborhood, postalCode });

        return res.status(200).json({
            status: 200,
            message: 'Customer updated successfully.',
            customer
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const deleteCustomer = async (req, res) => {
    const { id } = req.params;

    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({
                status: 404,
                message: 'Customer not found.'
            });
        }

        await customer.destroy();

        return res.status(200).json({
            status: 200,
            message: 'Customer deleted successfully.'
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
            error: error.message
        });
    }
};
// **************atención aca esta el controller p/ la impelementacion del grafico para saber cuantos usuaios por semana  registrados

const getUsersByWeek = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            attributes: [
                // Agrupar por rangos semanales: cada grupo representa una semana
                [
                    fn(
                        'DATE_FORMAT',
                        fn(
                            'DATE_ADD',
                            fn('DATE', col('fecha_creacion')), //este es para ebcontrael lunes de esa semana y a ese lunes le sumo6 dias
                            literal('INTERVAL(-WEEKDAY(fecha_creacion)) DAY')
                        ),
                        '%d-%m'  //este p/ formatear eje01/07
                    ),
                    'inicio_semana',
                ],
                [
                    fn(
                        'DATE_FORMAT',
                        fn(
                            'DATE_ADD',
                            fn(
                                'DATE_ADD',
                                fn('DATE', col('fecha_creacion')),
                                literal('INTERVAL(-WEEKDAY(fecha_creacion)) DAY')
                            ),
                            literal('INTERVAL 6 DAY')
                        ),
                        '%d-%m %b' //este me devuelve ej "28-08 Aug"
                    ),
                    'fin_semana',
                ],
                [fn('COUNT', col('id')), 'cantidad'],
            ],
            group: ['inicio_semana', 'fin_semana'],
            order: [[col('inicio_semana'), 'ASC']],
        });

        const formattedData = customers.map(item => ({
            semana: `${item.dataValues.inicio_semana} - ${item.dataValues.fin_semana}`,
            usuarios: parseInt(item.dataValues.cantidad, 10),
        }));
        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching users by week:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// controller para que el usuario gestione su perfil:
const getMyProfile = async (req, res) => {
    console.log('req.currentUser:', req.currentUser);
    try {
        const user = req.currentUser; // viene de protect middleware
        return res.status(200).json({
            status: 200,
            message: "Perfil obtenido correctamente",
            profile: user
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error al obtener perfil",
            error: error.message
        });
    }
};


// PUT /customer/profile
const updateMyProfile = async (req, res) => {
  try {
    const user = req.currentUser;
    let {
      name,
      phone,
      street,
      streetNumber,
      city,
      neighborhood,
      postalCode,
    } = req.body;

    // Convertir campos vacíos a null para evitar validación NOT EMPTY
    street = street?.trim() || null;
    streetNumber = streetNumber?.trim() || null;
    city = city?.trim() || null;
    neighborhood = neighborhood?.trim() || null;
    postalCode = postalCode?.trim() || null;

    const updatedData = {
      name: name?.trim() || user.name,
      phone: phone?.trim() || user.phone,
      street,
      streetNumber,
      city,
      neighborhood,
      postalCode,
    };

    // Subida de imagen de perfil
    if (req.file) {
      // Borrar la foto anterior si existe
      if (user.photo) {
        await deleteFromCloudinary(user.photo);
      }
      const result = await uploadToCloudinary(req.file.buffer);
      updatedData.photo = result.secure_url;
    } else if (req.body.photo === null) {
      // Si el usuario borró la foto
      if (user.photo) {
        await deleteFromCloudinary(user.photo);
      }
      updatedData.photo = null;
    }

    await user.update(updatedData);

    return res.status(200).json({
      status: 200,
      message: "Perfil actualizado correctamente",
      profile: user,
    });
  } catch (error) {
    console.error("Error en updateMyProfile:", error);
    return res.status(500).json({
      status: 500,
      message: "Error al actualizar perfil",
      error: error.message,
    });
  }
};

// Para traer mis compras esta de prueba
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.sub; // asumimos middleware de auth
    const orders = await Order.findAll({
      where: { id_cliente: userId },
      include: [{ model: Shipping, as: "shipping" }, { model: Product, as: "products" }]
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos", error: error.message });
  }
};


// PUT /customer/profile/change-password
const changePassword = async (req, res) => {
    try {
        const user = req.currentUser;

          // Verificar si el usuario se autenticó con Google
        if (user.authMethod === 'google') {
            return res.status(400).json({
                message: "No puedes cambiar la contraseña porque iniciaste sesión con Google."
            });
        }
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Contraseña actual y nueva son requeridas" });
        }

        // Verificar contraseña actual
        const match = await user.checkPassword(currentPassword);
        if (!match) {
            return res.status(400).json({ message: "Contraseña actual incorrecta" });
        }

        // Validar nueva contraseña
        if (newPassword.length < 8 || newPassword.length > 15) {
            return res.status(400).json({ message: "La nueva contraseña debe tener entre 8 y 15 caracteres" });
        }

        user.password = newPassword; // los hooks del modelo la hashearán
        await user.save();

        return res.status(200).json({
            status: 200,
            message: "Contraseña actualizada correctamente"
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error al cambiar contraseña",
            error: error.message
        });
    }
};



export { getCustomerById,getUserOrders, createCustomer,registerCustomer, updateCustomer, deleteCustomer, getUsersByWeek,getMyProfile,updateMyProfile,changePassword }