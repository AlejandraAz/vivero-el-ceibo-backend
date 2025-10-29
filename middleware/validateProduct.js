
const validateProduct = (req, res, next) => {
  const { name, description, price, stock, id_category } = req.body;

  if (!name || name.trim().length < 3 || name.trim().length > 100) {
    return res.status(400).json({
      status: 400,
      message: "Product name must be between 3 and 100 characters."
    });
  }

  if (!description || description.trim().length > 1000) {
    return res.status(400).json({
      status: 400,
      message: "Description must be at most 1000 characters."
    });
  }

  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({
      status: 400,
      message: "Price must be a valid number greater than or equal to 0."
    });
  }

  const parsedStock = Number(stock);
  if (isNaN(parsedStock) || parsedStock < 0) {
    return res.status(400).json({
      status: 400,
      message: "Stock must be a non-negative number."
    });
  }

  if (!id_category || id_category.trim() === "") {
    return res.status(400).json({
      status: 400,
      message: "Category ID is required."
    });
  }

  if (!req.files || req.files.length < 1 || req.files.length > 4) {
  return res.status(400).json({
    status: 400,
    message: "Debes subir entre 1 y 4 imágenes.",
  });
}


  next();
};
export default validateProduct;