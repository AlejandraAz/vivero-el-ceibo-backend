import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ProductImage from "../models/ProductImage.js";
import { Op} from "sequelize";
import Sequelize from "sequelize"; //este es p/ se esta usando en el grafico
// import createProductService from "../services/product.services.js";
import productService from "../services/product.services.js";
import deleteFromCloudinary from "../helpers/cloudinaryDelete.js";
import uploadToCloudinary from "../helpers/cloudinaryUpload.js";
import sortMainImageFirst from "../helpers/sortMainImagesFirst.js";
import Review from "../models/Review.js";

// el controller p/destacados:
const getFeaturedProducts =  async(req,res)=>{
      try {
        const featured = await Product.findAll({
          where:{featured:true,status: true },
          include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "url", "public_id", "is_main"], 
          // order: [['is_main', 'DESC'], ['createdAt', 'ASC']]
        },
        {
          model: Review,
          as: "reviews",      
          attributes: ["id", "ratings"], 
        },
      ],
          
        })

        featured.forEach(sortMainImageFirst);
        return res.status(200).json({ data: featured });
      } catch (error) {
        console.error("Error al obtener productos destacados:", error);
        return res.status(500).json({ message: "Error al obtener productos destacados" });
      }
}
const getAllProducts = async (req, res) => {
    const { page = 1, limit = 5, search, status, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) whereClause.name = { [Op.like]: `%${search}%` };
    if (status !== undefined) whereClause.status = status === "true";
    if (category) whereClause.id_category = category;

    try {
        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: {
                model: ProductImage,
                as: "images",
                attributes: ["id", "url", "public_id", "is_main"],
                order: [['is_main', 'DESC'], ['createdAt', 'ASC']]
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["id", "ASC"]],
              distinct: true 
        });

        rows.forEach(sortMainImageFirst);
        return res.status(200).json({
            status: 200,
            message: rows.length === 0 ? "No products found." : "Products retrieved successfully.",
            products: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const searchProducts = async (req, res) => {
  const { search = "", category = "", featured } = req.query;

  try {
    const whereConditions = {};

    // Búsqueda por nombre
    if (search.trim()) {
      whereConditions.name = { [Op.like]: `%${search.trim()}%` };
    }

    // Filtro destacado
    if (featured === "true") {
      whereConditions.featured = true;
    }

    // Filtro categoría
    const categoryFilter = category.trim()
      ? {
          name: { [Op.like]: `%${category.trim()}%` },
        }
      : undefined;

    const products = await Product.findAll({
      where: whereConditions,
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "url", "public_id"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          where: categoryFilter,
          required: !!categoryFilter,
        },
      ],
      limit: 15,
      order: [["name", "ASC"]],
    });

    products.forEach(sortMainImageFirst);

    return res.status(200).json({
      message: "Búsqueda realizada correctamente.",
      products,
    });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    return res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
};
const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id,{
          include:[{
            model:ProductImage,
            as:"images",
            attributes:["id","url","public_id"]
          },
        {
          model: Category,
          as: "category", 
          attributes: ["id", "name"],
        },],
           logging: console.log
        });

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: `Product with ID ${id} not found.`
            });
        }

        sortMainImageFirst(product);
        return res.status(200).json({
            status: 200,
            message: "Product retrieved successfully.",
            product
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const createProduct = async (req, res) => {
  const { name, description, price, stock, id_category } = req.body;
  const id_admin = req.currentUser.id;

  try {
    if (!req.files || req.files.length < 1 || req.files.length > 5) {
      return res.status(400).json({ message: "At least one image is required." });
    }
    console.log("Cantidad de archivos:", req.files ? req.files.length : 0);
    console.log("req.files:", req.files);


    const product = await productService.createProductService(
      { name, description, price, stock, id_admin, id_category },
      req.files
    );

    return res.status(201).json({
      status: 201,
      message: "Producto creado con éxito.",
      product,
    });

  } catch (error) {
    console.error("🛑 Error al crear producto:", error);
    return res.status(500).json({
      status: 500,
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    stock,
    featured,
    id_category,
    removeImages,
    mainImageId,
    mainNewIndex,
  } = req.body;
  const files = req.files;

  try {
    const product = await Product.findByPk(id, {
      include: { model: ProductImage, as: "images" },
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // ===================== ELIMINAR IMÁGENES SELECCIONADAS =====================
    const removeIds = removeImages ? JSON.parse(removeImages) : [];
    for (const imgId of removeIds) {
      const img = await ProductImage.findByPk(imgId);
      if (img) {
        await deleteFromCloudinary(img.public_id);
        await img.destroy();
      }
    }

    // ===================== SUBIR NUEVAS IMÁGENES =====================
    let uploadedImages = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
          id_product: id,
          is_main: false,
        });
      }

      await ProductImage.bulkCreate(uploadedImages);

      // 👉 Marcar nueva como principal si se indicó mainNewIndex
      if (mainNewIndex !== undefined) {
        const index = parseInt(mainNewIndex, 10);
        if (!isNaN(index) && uploadedImages[index]) {
          // ✅ Desmarcar todas antes
          await ProductImage.update({ is_main: false }, { where: { id_product: id } });

          const img = await ProductImage.findOne({
            where: {
              id_product: id,
              public_id: uploadedImages[index].public_id,
            },
          });

          if (img) {
            await img.update({ is_main: true });
          }
        }
      }
    }

    // ===================== MARCAR EXISTENTE COMO PRINCIPAL =====================
    if (mainImageId && mainNewIndex === undefined) {
      // Si no se envió mainNewIndex pero sí mainImageId
      await ProductImage.update({ is_main: false }, { where: { id_product: id } });
      await ProductImage.update({ is_main: true }, { where: { id: mainImageId } });
    }

    // ===================== FALLBACK: Marcar una como principal si ninguna está marcada =====================
    const hasMain = await ProductImage.findOne({
      where: { id_product: id, is_main: true },
    });

    if (!hasMain) {
      const firstImage = await ProductImage.findOne({
        where: { id_product: id },
        order: [["fecha_creacion", "ASC"]],
      });

      if (firstImage) {
        await firstImage.update({ is_main: true });
      }
    }

    // ===================== ACTUALIZAR DATOS DEL PRODUCTO =====================
    await product.update({
      name,
      description,
      price,
      stock,
      featured,
      id_category,
    });

    // ===================== RESPUESTA =====================
    const updated = await Product.findByPk(id, {
      include: { model: ProductImage, as: "images" },
    });

    
sortMainImageFirst(updated); 
    res.json({ message: "Producto actualizado correctamente", product: updated });
  } catch (error) {
    console.error("🛑 Error en updateProduct:", error);
    res.status(500).json({ message: "Error al actualizar producto", error: error.message });
  }
};



const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const { featured } = req.body; // esperamos true o false

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                status: 404,
                message: "Product not found.",
            });
        }
        if (!product.status) {
    return res.status(400).send({ error: "No se puede destacar un producto inactivo." });
  }

        product.featured = featured;
        await product.save();

        return res.status(200).json({
            status: 200,
            message: `Product marked as ${featured ? "featured" : "not featured"}.`,
            product,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message,
        });
    }
};
const restoreProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found."
      });
    }

    if (product.status === true) {
      return res.status(400).json({
        status: 400,
        message: "Product is already active."
      });
    }

    product.status = true;
    await product.save();

    return res.status(200).json({
      status: 200,
      message: "Product restored successfully.",
      product
    });

  } catch (error) {
    console.error("🛑 Error restoring product:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id,{
          include:{
            model:ProductImage,
            as:"images"
          }
        });

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: "Product not found."
            });
        }


    // Inactivar producto en lugar de eliminar
    product.status = false;
    await product.save();

        return res.status(200).json({
            status: 200,
            message: "Product deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error.",
            error: error.message
        });
    }
};
// *************************Atención************************
// las siguientes son p/obtener datos para los graficos:el primero es stock total por categoria
const getStockByCategory = async (req, res) => {
  try {
    const data = await Product.findAll({
      attributes: [
        'id_category',
        [Sequelize.fn('SUM', Sequelize.col('stock')), 'totalStock']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name'],
      }],
      group: ['id_category', 'category.id'],
    });

    const result = data.map(item => ({
      category: item.category.name,
      stock: parseInt(item.dataValues.totalStock, 10),
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error en getStockByCategory:", error);
    return res.status(500).json({ success: false, message: 'Error al obtener stock por categoría' });
  }
};

// productos por categoria
const getProductsCountByCategory = async (req, res) => {
  try {
    const data = await Product.findAll({
      attributes: [
        'id_category',
        [Sequelize.fn('COUNT', Sequelize.col('Product.id')), 'countProducts']
      ],
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      group: ['id_category', 'category.id'],
    });

    const result = data.map(item => ({
      category: item.category.name,
      count: parseInt(item.get('countProducts'), 10),
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error en getProductsCountByCategory:", error);
    return res.status(500).json({ success: false, message: 'Error al contar productos por categoría' });
  }
};

const getCatalogProducts = async (req, res) => {
  try {
    const { featured, order = "newest", page = 1, limit = 8 } = req.query;

    const where = {};
    if (featured === "true") {
      where.featured = true; // solo productos en oferta/destacados
    }

    // 🔹 Definir orden dinámico
    let orderOption = [["fecha_creacion", "DESC"]];
    if (order === "price_asc") orderOption = [["price", "ASC"]];
    if (order === "price_desc") orderOption = [["price", "DESC"]];
    if (order === "newest") orderOption = [["fecha_creacion", "DESC"]];

    const offset = (page - 1) * limit;

    // 🔹 Buscar productos con paginación y relaciones
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "url", "public_id", "is_main"],
        },
        {
          model: Review,
          as: "reviews",
          attributes: ["id", "ratings", "comment", "fecha_creacion"],
        },
      ],
      order: orderOption,
      offset,
      limit: parseInt(limit),
      distinct: true,
    });

    // 🔹 Ordenar la imagen principal primero
    products.forEach(sortMainImageFirst);

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: 200,
      message: "Products retrieved successfully.",
      totalProducts: count,
      totalPages,
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


export { getFeaturedProducts,getAllProducts,searchProducts, getProductById, createProduct, updateProduct, toggleFeatured, restoreProduct,deleteProduct,getStockByCategory,getProductsCountByCategory,getCatalogProducts };