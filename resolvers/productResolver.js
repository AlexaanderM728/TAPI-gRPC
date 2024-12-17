const products = require("../data/products.json");
const categories = require("../data/categories.json");
const suppliers = require("../data/suppliers.json");
const grpc = require("@grpc/grpc-js");
const fs = require("fs");
const path = require("path");

// Lista produktów z filtrowaniem i paginacją
function listProducts(call, callback) {
  let filteredProducts = products; // Startujemy z pełną listą produktów

  const {
    name_contains,
    category_id,
    min_carbohydrates,
    max_carbohydrates,
    min_proteins,
    max_proteins,
    min_fats,
    max_fats,
    limit,
    offset,
  } = call.request;

  // Filtrowanie po nazwie (ignorujemy puste stringi)
  if (name_contains && name_contains.trim() !== "") {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(name_contains.toLowerCase())
    );
  }

  // Filtrowanie po kategorii (ignorujemy, jeśli category_id jest 0)
  if (category_id && category_id > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category_id === parseInt(category_id)
    );
  }

  // Filtrowanie po węglowodanach
  if (min_carbohydrates && min_carbohydrates > 0) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.nutritional_values.carbohydrates >= parseFloat(min_carbohydrates)
    );
  }
  if (max_carbohydrates && max_carbohydrates > 0) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.nutritional_values.carbohydrates <= parseFloat(max_carbohydrates)
    );
  }

  // Filtrowanie po białkach
  if (min_proteins && min_proteins > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => roundToTwo(p.nutritional_values.proteins) >= parseFloat(min_proteins.toFixed(2))
    );
  }
  if (max_proteins && max_proteins > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => roundToTwo(p.nutritional_values.proteins) <= parseFloat(max_proteins.toFixed(2))
    );
    
  }

  // Filtrowanie po tłuszczach
  if (min_fats && min_fats > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => p.nutritional_values.fats >= parseFloat(min_fats)
    );
  }
  if (max_fats && max_fats > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => p.nutritional_values.fats <= parseFloat(max_fats)
    );
  }

  // Paginacja
  const startIndex = offset || 0;
  const endIndex = startIndex + (limit || filteredProducts.length);

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);


  callback(null, { products: paginatedProducts });
}


function roundToTwo(num) {
  return parseFloat(num.toFixed(2)); // Zaokrąglenie do dwóch miejsc po przecinku
}
// Pobierz produkt po ID
function getFullProductById(call, callback) {
  const { id } = call.request;

  // Znajdź produkt na podstawie ID
  const product = products.find((p) => p.id === id);
  if (!product) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Produkt o ID ${id} nie został znaleziony.`,
    });
  }

  // Pobierz pełne dane kategorii
  const category = categories.find((c) => c.id_category === product.category_id);
  if (!category) {
    return callback({
      code: grpc.status.INTERNAL,
      message: `Kategoria o ID ${product.category_id} nie została znaleziona.`,
    });
  }

  // Pobierz pełne dane dostawcy
  const supplier = suppliers.find((s) => s.id_supplier === product.id_supplier);
  if (!supplier) {
    return callback({
      code: grpc.status.INTERNAL,
      message: `Dostawca o ID ${product.id_supplier} nie został znaleziony.`,
    });
  }

  // Zbuduj pełny obiekt FullProduct
  const fullProduct = {
    id: product.id,
    name: product.name,
    category_id: {
      id_category: category.id_category,
      name: category.name,
      main_category: category.main_category,
      description: category.description,
    },
    id_supplier: {
      id_supplier: supplier.id_supplier,
      name: supplier.name,
      contact_info: {
        address: supplier.contact_info.address,
        phone: supplier.contact_info.phone,
      },
      rating: roundToTwo(supplier.rating),
    },
    nutritional_values: {
      carbohydrates: roundToTwo(product.nutritional_values.carbohydrates),
      proteins: roundToTwo(product.nutritional_values.proteins),
      fats: roundToTwo(product.nutritional_values.fats)
    },
  };
  // Zwróć pełny produkt
  callback(null, fullProduct);
}

function GetProductById(call, callback) {
  const productId = call.request.id;

  // Znajdowanie produktu po ID
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Produkt z ID ${productId} nie istnieje.`,
    });
  }

  // Zwracanie surowych danych bez dodatkowego przetwarzania
  const rawProduct = {
    id: product.id,
    name: product.name,
    category_id: product.category_id,
    id_supplier: product.id_supplier,
    nutritional_values: {
      carbohydrates: product.nutritional_values.carbohydrates,
      proteins: product.nutritional_values.proteins,
      fats: product.nutritional_values.fats,
    },
  };

  callback(null, rawProduct);
}

function addProduct(call, callback) {
  const { name, category_id, supplier_id, nutritional_values } = call.request;

  // Sprawdzenie, czy kategoria istnieje
  const category = categories.find((c) => c.id_category === category_id);
  if (!category) {
    return callback({
      code: 404,
      message: `Kategoria z ID ${category_id} nie istnieje.`,
    });
  }

  // Sprawdzenie, czy dostawca istnieje
  const supplier = suppliers.find((s) => s.id_supplier === supplier_id);
  if (!supplier) {
    return callback({
      code: 404,
      message: `Dostawca z ID ${supplier_id} nie istnieje.`,
    });
  }

  // Tworzenie nowego produktu
  const newProduct = {
    id: products.length + 1,
    name,
    category_id,
    id_supplier: supplier_id,
    nutritional_values: {
      carbohydrates: roundToTwo(nutritional_values.carbohydrates),
      proteins: roundToTwo(nutritional_values.proteins),
      fats: roundToTwo(nutritional_values.fats),
    },
  };

  // Dodanie produktu do listy
  products.push(newProduct);

  // Zapis do pliku JSON
  fs.writeFileSync(
    path.resolve(__dirname, "../data/products.json"), // Poprawiona ścieżka
    JSON.stringify(products, null, 2)
  );

  // Zwrócenie nowego produktu
  callback(null, newProduct);
}



module.exports = {
  listProducts,
  getFullProductById,
  GetProductById,
  addProduct
};