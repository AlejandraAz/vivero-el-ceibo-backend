import cloudinary from "../config/cloudinary.js";
import deleteFromCloudinary from "../helpers/cloudinaryDelete.js";
import ProductImage from "../models/ProductImage.js";

const deleteAllImagesByProductId = async (req, res) => {
    const { productId } = req.params;
    try {
        const images = await ProductImage.findAll({ where: { productId } });

        // p/ eliminar de cloudinary
        await Promise.all(
            images
                .filter(img => img.public_id)
                .map(img => deleteFromCloudinary(img.public_id))
        )

        await ProductImage.destroy({ where: { productId } });
        return res.status(200).json({ message: 'Todas las imágenes fueron eliminadas correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar todas las imágenes' });
    }
}

const deleteImageById = async (req, res) => {
    const { id } = req.params;
    try {
        const image = await ProductImage.findByPk(id);
        if (!image) return res.status(404).json({ message: 'Imagen no encontrada' });

        // Eliminar de Cloudinary si usás
        if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        await image.destroy();
        res.status(200).json({ message: 'Imagen eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error eliminando imagen' });
    }
}

export {
    deleteAllImagesByProductId, deleteImageById
}