const categories = require("../data/categories.json");

// Lista kategorii z filtrowaniem
const listCategories = (call, callback) => {
  let filteredCategories = categories;

  const { name_contains } = call.request;

  // Filtrowanie
  if (name_contains) {
    filteredCategories = filteredCategories.filter((cat) =>
      cat.name.toLowerCase().includes(name_contains.toLowerCase())
    );
  }

  callback(null, { categories: filteredCategories });
};

// Pobierz kategorię po ID
const getCategoryById = (call, callback) => {
  const requestedId = parseInt(call.request.id_category, 10);
  const category = categories.find(cat => cat.id_category === requestedId);

  if (!category) {
    console.error(`Kategoria nie znaleziona: ${requestedId}`);
    callback({
      code: grpc.status.NOT_FOUND,
      message: `Kategoria z ID ${requestedId} nie istnieje.`,
    });
    return;
  }
  callback(null, category);
};

module.exports = {
  listCategories,
  getCategoryById,
};