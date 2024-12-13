const suppliers = require("../data/suppliers.json");

// Lista dostawców z filtrowaniem i sortowaniem
const listSuppliers = (call, callback) => {
  let filteredSuppliers = suppliers;

  const { min_rating, max_rating, sort_by, sort_order } = call.request;

  // Filtrowanie
  if (min_rating !== undefined) {
    filteredSuppliers = filteredSuppliers.filter((sup) => sup.rating >= min_rating);
  }
  if (max_rating !== undefined) {
    filteredSuppliers = filteredSuppliers.filter((sup) => sup.rating <= max_rating);
  }

  // Sortowanie
  if (sort_by) {
    filteredSuppliers.sort((a, b) => {
      const order = sort_order === "desc" ? -1 : 1;
      if (a[sort_by] < b[sort_by]) return -1 * order;
      if (a[sort_by] > b[sort_by]) return 1 * order;
      return 0;
    });
  }

  callback(null, { suppliers: filteredSuppliers });
};

// Pobierz dostawcę po ID
const getSupplierById = (call, callback) => {
  const supplier = suppliers.find((sup) => sup.id_supplier === call.request.id_supplier);
  if (supplier) {
    callback(null, supplier);
  } else {
    callback(new Error("Dostawca nie znaleziony"));
  }
};

module.exports = {
  listSuppliers,
  getSupplierById,
};