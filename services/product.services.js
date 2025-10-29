import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import uploadToCloudinary from "../helpers/cloudinaryUpload.js";
import deleteFromCloudinary from "../helpers/cloudinaryDelete.js";


const createProductService = async (data, files) => {

    const product = await Product.create(data);

    // 2. Subir imágenes a Cloudinary
    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
        const result = await uploadToCloudinary(files[i].buffer);
        uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
            id_product: product.id,
            is_main: i === 0, //  Primera imagen es principal
        });
    }

    await ProductImage.bulkCreate(uploadedImages);
    return product;
};


const updateProductService = async (id, data, files) => {
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
    } = data;

    const product = await Product.findByPk(id, {
        include: { model: ProductImage, as: "images" },
    });

    if (!product) throw new Error("Producto no encontrado.");

    const removeIds = removeImages ? JSON.parse(removeImages) : [];

    // === ELIMINAR IMÁGENES ===
    if (removeIds.length) {
        const imgsToDelete = await ProductImage.findAll({
            where: { id: removeIds, id_product: id },
        });

        for (const img of imgsToDelete) {
            await deleteFromCloudinary(img.public_id);
        }

        await ProductImage.destroy({
            where: { id: removeIds, id_product: id },
        });
    }

    // === VALIDAR LÍMITE DE 5 ===
    const remainingCount = product.images.length - removeIds.length;
    const newCount = files?.length || 0;

    if (remainingCount + newCount > 5) {
        throw new Error("No puedes tener más de 5 imágenes por producto.");
    }

    // === SUBIR NUEVAS ===
    let uploadedImages = [];
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const result = await uploadToCloudinary(files[i].buffer);
            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id,
                id_product: id,
                is_main: false, // Inicialmente no principal
            });
        }

        await ProductImage.bulkCreate(uploadedImages);

        // Si viene mainNewIndex, marcar esa como principal
        if (mainNewIndex !== undefined) {
            const index = parseInt(mainNewIndex, 10);
            if (!isNaN(index) && uploadedImages[index]) {
                await ProductImage.update({ is_main: false }, { where: { id_product: id } });

                const img = await ProductImage.findOne({
                    where: {
                        id_product: id,
                        public_id: uploadedImages[index].public_id,
                    },
                });

                if (img) await img.update({ is_main: true });
            }
        }
    }

    // === CAMBIAR PRINCIPAL EXISTENTE ===
    if (mainImageId && mainNewIndex === undefined) {
        await ProductImage.update({ is_main: false }, { where: { id_product: id } });
        await ProductImage.update({ is_main: true }, { where: { id: mainImageId } });
    }

    // === FALLBACK: Asegurar que haya una imagen principal ===
    const hasMain = await ProductImage.findOne({
        where: { id_product: id, is_main: true },
    });

    if (!hasMain) {
        const firstImage = await ProductImage.findOne({
            where: { id_product: id },
            order: [["fecha_creacion", "ASC"]],
        });

        if (firstImage) await firstImage.update({ is_main: true });
    }

    // === ACTUALIZAR CAMPOS ===
    await product.update({
        name: name ?? product.name,
        description: description ?? product.description,
        price: price ?? product.price,
        stock: stock ?? product.stock,
        featured: featured ?? product.featured,
        id_category: id_category ?? product.id_category,
    });

    // === RETORNAR ===
    const updatedProduct = await Product.findByPk(id, {
        include: { model: ProductImage, as: "images" },
    });

    return updatedProduct;
};

export default { createProductService, updateProductService };