import { v2 } from "cloudinary";
import cloudinary from "../config/cloudinary.js";



const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error al eliminar imagen en Cloudinary:", error);
        throw error;
    }
};

export default deleteFromCloudinary;