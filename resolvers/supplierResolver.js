const suppliers = require("../data/suppliers.json");
const fs = require("fs");
const path = require("path");
// Lista dostawców z filtrowaniem i sortowaniem
const listSuppliers =(call, callback) => {

  let filteredSuppliers = suppliers; // Startuj z pełną listą

  const { min_rating, max_rating, sort_by, sort_order } = call.request;

  // Filtrowanie po ratingu
  if (min_rating) {
    filteredSuppliers = filteredSuppliers.filter(s => s.rating >= min_rating);
  }

  if (max_rating && max_rating > 0) {
    filteredSuppliers = filteredSuppliers.filter(s => s.rating <= max_rating);
  }

  if (sort_by) {
    filteredSuppliers.sort((a, b) => {
      const aValue = a[sort_by];
      const bValue = b[sort_by];

      if (aValue < bValue) return sort_order === "desc" ? 1 : -1;
      if (aValue > bValue) return sort_order === "desc" ? -1 : 1;
      return 0;
    });
  }
 
  callback(null, { suppliers: filteredSuppliers });
}

// Pobierz dostawcę po ID
const getSupplierById = (call, callback) => {
  const supplier = suppliers.find((sup) => sup.id_supplier === call.request.id_supplier);
  if (supplier) {
    callback(null, supplier);
  } else {
    callback(new Error("Dostawca nie znaleziony"));
  }
};

function roundToTwo(num) {
  return parseFloat(num.toFixed(2)); // Zaokrąglenie do dwóch miejsc po przecinku
}
// dodawniae dostawcy 
const addSupplier = (call, callback) => {

  const {name , contact_info, rating} = call.request;

  const newSupplier = {
    id_supplier: suppliers.length + 1,
    name: name,
    contact_info: {
      address: contact_info.address,
      phone: contact_info.phone,
    },
    rating: roundToTwo(rating),
  };

  suppliers.push(newSupplier);

  fs.writeFileSync(
    path.resolve(__dirname, "../data/suppliers.json"), 
    JSON.stringify(suppliers, null, 2)
  );

  callback(null, newSupplier);
}
//usuwanie dostawcy 

const deletedSupplier = (call, callback) =>{
  const { id_supplier } = call.request; 

  const supplierIndex = suppliers.findIndex((s) => s.id_supplier === id_supplier);

  if(supplierIndex === -1){
    return callback({
      code:404,
      message: `Suppplier z ID ${id} nie istnieje`,
    });
  }
  const deletedSupplier = suppliers.splice(supplierIndex, 1)[0];

  fs.writeFileSync(
    path.resolve(__dirname, '../data/suppliers.json'),
    JSON.stringify(suppliers, null, 2)
  );

  callback(null, deletedSupplier);
  }
// edutowanie dostacy 

const updateSupplier = (call, callback) => {

  // Znalezienie dostawcy po ID
  const supplierIndex = suppliers.findIndex(
    (s) => s.id_supplier === call.request.id_supplier
  );
  if (supplierIndex === -1) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Dostawca z ID ${call.request.id_supplier} nie istnieje.`,
    });
  }

  const existingSupplier = suppliers[supplierIndex];

  // Tworzenie nowego obiektu `contact_info` uwzględniając wartości domyślne gRPC
  const updatedContactInfo = {
    address:
      call.request.contact_info.address && call.request.contact_info.address.trim() !== ""
        ? call.request.contact_info.address
        : existingSupplier.contact_info.address,
    phone:
      call.request.contact_info.phone && call.request.contact_info.phone.trim() !== ""
        ? call.request.contact_info.phone
        : existingSupplier.contact_info.phone,
  };

  // Tworzenie zaktualizowanego obiektu dostawcy
  const updatedSupplier = {
    id_supplier: existingSupplier.id_supplier,
    name: call.request.name && call.request.name.trim() !== "" ? call.request.name : existingSupplier.name,
    contact_info: updatedContactInfo,
    rating: roundToTwo(call.request.rating) || existingSupplier.rating,
  };

  // Aktualizacja listy dostawców
  suppliers[supplierIndex] = updatedSupplier;

  // Zapis do pliku JSON
  try {
    fs.writeFileSync(
      path.resolve(__dirname, "../data/suppliers.json"),
      JSON.stringify(suppliers, null, 2)
    );
    console.log("Dane zapisane do pliku JSON.");
  } catch (error) {
    return callback({
      code: grpc.status.INTERNAL,
      message: "Nie udało się zapisać zmian w pliku.",
    });
  }

  // Zwracanie zaktualizowanego dostawcy
  callback(null, updatedSupplier);
};

module.exports = {
  listSuppliers,
  getSupplierById,
  addSupplier,
  deletedSupplier,
  updateSupplier
};