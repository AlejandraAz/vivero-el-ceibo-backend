import multer from "multer";

const storage =  multer.memoryStorage()  // guardamos la imagen en memoria para mandarla a Cloudinary
const upload = multer({storage});


export default upload;