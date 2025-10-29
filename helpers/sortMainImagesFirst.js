//creo la funcion para que ordene como imagen primera la seleccionada como principal
const sortMainImageFirst = (product) => {
  if (product.images && Array.isArray(product.images)) {
    product.images.sort((a, b) => {
      if (a.is_main === b.is_main) return 0;
      return a.is_main ? -1 : 1;
    });
  }
};

export default sortMainImageFirst;
