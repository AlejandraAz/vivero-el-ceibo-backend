//Helper para borrar imágenes de Cloudinary y DB al editar un producto

const removeProductImages = async (removeIds, productId) => {
  const imagesToRemove = await ProductImage.findAll({
    where: { id: removeIds, id_product: productId }
  });

  for (const img of imagesToRemove) {
    await deleteFromCloudinary(img.public_id); //  borra en Cloudinary
    await img.destroy(); // borra en DB
  }
};
export default removeProductImages;