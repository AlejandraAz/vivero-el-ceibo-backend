import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderDetail from "../models/OrderDetail.js";
import Customer from "../models/Customer.js";
import Shipping from "../models/Shipping.js";
import { Op,col } from "sequelize";

// Obtener todos los usuarios
const getAllCustomers = async (req, res) => {
    try {

        console.log("GET /admin/customers");

        const {page = 1,limit = 10,q ="",status} = req.query;
        const offset = (page - 1) * limit;

        // filtros dinamicos:
        const whereClause = {};

        if(status){
            whereClause.accountStatus = status;
        }

        if(q){
            // Op.or = condición OR, usado para búsquedas flexibles.
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${q}%` } },
                { email: { [Op.like]: `%${q}%` } }
            ]
        }
        const customers = await Customer.findAndCountAll({
            where:whereClause,
            limit:parseInt(limit), // cuantos por página
            offset:parseInt(offset), // desde dónde empieza
            order: [["fecha_creacion", "DESC"]], // ordenados del más nuevo al más viejo con el nombre de la tabla
            attributes: ["id", "name", "email", "accountStatus","rol",  ["fecha_creacion", "createdAt"],]  //exponer fecha_creacion con alias "createdAt" en la respuesta:
        })
        // los registros de esa página.son los customer.rows
        // la cantidad total de registros que cumplen el where. customer.count
        

        res.json({
            success: true,
            data: customers.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(customers.count / limit),
                totalItems: customers.count,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (err) {
        console.error("Error en getAllCustomer:", err);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: "No se pudieron obtener los usuarios",
        });
    }
};

// Bloquear / activar usuario
const toggleCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);

        if (!customer) return res.status(404).json({ message: "Usuario no encontrado" });

        customer.accountStatus = customer.accountStatus === "activo" ? "bloqueado" : "activo";
        await customer.save();

        res.json({ message: `Usuario ahora está ${customer.accountStatus}`, customer });
    } catch (err) {
        res.status(500).json({ message: "Error al actualizar estado del usuario" });
    }
};
const updateAdminStatus = async (req, res) => {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!['activo', 'bloqueado'].includes(accountStatus)) {
        return res.status(400).json({ message: "Estado inválido" });
    }

    try {
        const admin = await Admin.findByPk(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin no encontrado" });
        }

        admin.accountStatus = accountStatus;
        await admin.save();

        return res.status(200).json({ message: "Estado actualizado", admin });
    } catch (error) {
        console.error("Error al cambiar el estado del admin:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET all admins (en caso de ser necesario por ahora hay uno)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            attributes: { exclude: ['password'] }, // no devolver la contraseña 
            order: [['fecha_creacion', 'DESC']] // para ver cuando se creó
        });
        
        return res.status(200).json({
            status: 200,
            message: 'Admins retrieved successfully.',
            admins
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
        });
    }
};

// Para crear un nuevo admin  de manera manual ademas del que tengo en el seed
const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 400,
                message: 'Name, email, and password are required.'
            });
        }

        const existingAdmin = await Admin.findOne({ where: { email } });
        if (existingAdmin) {
            return res.status(409).json({
                status: 409,
                message: 'Email already registered.'
            });
        }

        const admin = await Admin.create({ name, email, password });
        return res.status(201).json({
            status: 201,
            message: 'Admin created successfully.',
            admin
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Server error.',
        });
    }
};

// Controlador exclusivo para ADMIN - Obtener todos los pedidos con detalle del cliente
const getAllOrdersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, status, shippingStatus } = req.query;
    const offset = (page - 1) * limit;

    const orderWhere = {};
    if (status) orderWhere.status = status;

    // Configuramos include para Customer con filtro search
    const customerInclude = {
      model: Customer,
      as: "customer",
      attributes: ["id", "name", "email","phone"],
      where: search
        ? {
            [Op.or]: [
              { nombre: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
            ],
          }
        : undefined,
      required: !!search, // solo filtra si hay search
    };

    // Include Shipping
    const shippingInclude = {
      model: Shipping,
      as: "shipping",
      where: shippingStatus ? { shippingStatus } : undefined,
      // required: false,
      required: !!shippingStatus, // si hay filtro, forzamos INNER JOIN

    };

    const { count, rows } = await Order.findAndCountAll({
      where: orderWhere,
      include: [
        customerInclude,
        shippingInclude,
        {
          model: OrderDetail,
          as: "details",
          include: [{ model: Product, as: "product", attributes: ["id", "name", "price"] }],
        },
      ],
      distinct: true,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["fecha_creacion", "DESC"]],
    });

    const formattedOrders = rows.map(order => {
      const products = order.details.map(d => ({
        id: d.product?.id,
        name: d.product?.name,
        price: parseFloat(d.unit_price || d.product?.price || 0),
        quantity: d.quantity,
        subtotal: parseFloat(d.subtotal || (d.unit_price || d.product?.price || 0) * d.quantity),
      }));
      
         // Subtotal = suma de subtotales de productos
  const subtotal = products.reduce((sum, p) => sum + p.subtotal, 0);

  // Total = en tu caso ya no sumamos impuestos
  const total = subtotal;

      return {
        id: order.id,
        number_order: order.number_order,
        customer: order.customer,
        shipping: order.shipping,
        products,
        subtotal,
        // impuestos,
        total,
        payment_method: order.payment_method,
        delivery_type: order.delivery_type,
        estado: order.status,
        fecha_creacion: order.fecha_creacion,
        fecha_actualizacion: order.fecha_actualizacion,
      };
    });

    res.status(200).json({
      status: 200,
      orders: formattedOrders,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: error.message });
  }
};



const getOrderDetailAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByPk(id, {
      include: [
        { model: Customer, as:"customer", attributes: ['id', 'name', 'email','phone'] },
        { model: Shipping, as:"shipping", attributes: ['street', 'number', 'city', 'province', 'postalCode'] },
        {
          model: OrderDetail,
          as:"details",
          include: [
            { model: Product, as:"product", attributes: ['id','name', 'price'] },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: 'Order not found.',
      });
    }

    // Mapear los productos y calcular subtotal de cada uno
    const products = order.details.map(detail => ({
      id: detail.product.id,
      name: detail.product.name,
      price: parseFloat(detail.product.price),
      quantity: detail.cantidad,
      subtotal: parseFloat(detail.subtotal),
    }));

    res.status(200).json({
      status: 200,
      message: 'Order detail retrieved.',
      order: {
        id: order.id,
        customer: order.customer,
        shipping: order.shipping,
        products,
        subtotal: order.subtotal,
        impuestos: order.impuestos,
        total: order.total || products.reduce((sum, p) => sum + p.subtotal, 0),
        payment_method: order.payment_method,
        delivery_type: order.delivery_type,
        estado: order.estado,
        fecha_creacion: order.fecha_creacion,
        fecha_actualizacion: order.fecha_actualizacion,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error.',
    });
  }
};

//Controlador exclusivo para ADMIN - Actualizar estado del pedido
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    let { status } = req.body;

    status = status.toLowerCase().trim();
    
  console.log("Estado recibido:", status);
    const validStatuses = ['pendiente', 'procesando', 'completado', 'cancelado'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid status. Allowed values: pendiente, procesando, completado, cancelado.',
        });
    }

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found.',
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            status: 200,
            message: `Order status updated to '${status}'.`,
            order,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error.',
        });
    }
};

const updateShippingStatus = async (req, res) => {
  try {
    const { id } = req.params; // id del envío
    const { shipping_status } = req.body;

    // Buscar el envío por su ID
    const shipping = await Shipping.findByPk(id);

    if (!shipping) {
      return res.status(404).json({ status: 404, message: "Envío no encontrado." });
    }

    // Actualizar estado
    shipping.shippingStatus = shipping_status;
    await shipping.save();

    res.status(200).json({
      status: 200,
      message: "Estado de envío actualizado correctamente.",
      shippingStatus: shipping.shippingStatus,
    });
  } catch (error) {
    console.error("Error actualizando estado de envío:", error);
    res.status(500).json({ status: 500, message: "Error interno del servidor.", error: error.message });
  }
};



export { getAllCustomers,updateShippingStatus,toggleCustomerStatus, getAllAdmins, updateAdminStatus,createAdmin, getAllOrdersAdmin, getOrderDetailAdminById, updateOrderStatus };
