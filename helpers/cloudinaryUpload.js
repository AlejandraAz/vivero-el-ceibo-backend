// En la carpeta helpers uso lo que es funciones tecnicas reutilizables en este caso p/subir imgs
// lo creo p/ centralizar a subida de img en caso de en un futuro cambiar cloudinary por otro
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier"; //convierte un Buffer como el de multer en strem legible

//para subir img de memoria en un buffer {Buffer} le mando el parametro a la función y me devuelve la funcion una promesa que resuelve en un objeto
const uploadToCloudinary = (buffer)=>{
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
        (error, result) => {
        if (result) resolve(result);
        else reject(error);
        }
    );
        streamifier.createReadStream(buffer).pipe(stream)
    })
}
export default uploadToCloudinary;