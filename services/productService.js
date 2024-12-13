const products = require("../data/products.json");

// Lista produktów z filtrowaniem i paginacją
const listProducts = (call, callback) => {
  let filteredProducts = products;

  const { min_carbohydrates, max_carbohydrates, category_id, limit, offset } = call.request;

  // Filtrowanie
  if (min_carbohydrates !== undefined) {
    filteredProducts = filteredProducts.filter(
      (prod) => prod.nutritional_values.carbohydrates >= min_carbohydrates
    );
  }
  if (max_carbohydrates !== undefined) {
    filteredProducts = filteredProducts.filter(
      (prod) => prod.nutritional_values.carbohydrates <= max_carbohydrates
    );
  }
  if (category_id !== undefined) {
    filteredProducts = filteredProducts.filter(
      (prod) => prod.category_id === category_id
    );
  }

  // Paginacja
  const start = offset || 0;
  const end = limit ? start + limit : filteredProducts.length;
  filteredProducts = filteredProducts.slice(start, end);

  callback(null, { products: filteredProducts });
};

// Pobierz produkt po ID
const getProductById = (call, callback) => {
  const product = products.find((prod) => prod.id === call.request.id);
  if (product) {
    callback(null, product);
  } else {
    callback(new Error("Produkt nie znaleziony"));
  }
};

module.exports = {
  listProducts,
  getProductById,
};