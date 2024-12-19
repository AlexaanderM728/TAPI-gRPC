const categories = require("../data/categories.json");
const fs = require("fs");
const path = require("path");
const grpc = require("@grpc/grpc-js");

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

// dodaj nowa kategorie 
const addCategory = (call, callback) =>{
  const {name, main_category, description } = call.request;

  const newCategory = {
    id_category: categories.length +1,
    name: name,
    main_category: main_category,
    description: description
  };

  categories.push(newCategory);

  fs.writeFileSync(
    path.resolve(__dirname, '../data/categories.json'),
    JSON.stringify(categories, null, 2)
  );
  
  callback(null, newCategory);
}

// usun kategorie 
const deletedCategory = (call, callback) =>{
  const { id_category } = call.request;

  const categoryIndex = categories.findIndex((p) => p.id_category === id_category);

  if(categoryIndex === -1){
    return callback({
      code: 404,
      message: `Categoria z ID ${id_category} nie istnieje`,
    });
  }

  const deletedCategory = categories.splice(categoryIndex, 1)[0];

  fs.writeFileSync(
    path.resolve(__dirname, '../data/categories.json'),
    JSON.stringify(categories,null, 2)
  );

  callback(null, deletedCategory);
 }
//edutyj kategorie 
const UpdateCategory = (call, callback) =>{
  const categoryIndex = categories.findIndex((c) => c.id_category === call.request.id_category);

  if(categoryIndex === -1){
    return callback({
      code: grpc.status.NOT_FOUND,
      message:`Category z id ${id_category} nie istnieje`,
    });
  }


  const existingCategory = categories[categoryIndex];

  const updatedCategory = {
    id_category: existingCategory.id_category,
    name: call.request.name || existingCategory.name,
    main_category: call.request.main_category || existingCategory.main_category,
    description: call.request.description || existingCategory.description,
  };

  console.log("zaktualizowan kateogire", updatedCategory);

  categories[categoryIndex] = updatedCategory;

  try{
    fs.writeFileSync(
      path.resolve(__dirname, '../data/categories.json'),
      JSON.stringify(categories, null, 2)
    );
  }catch (error){
    return callback({
      code: grpc.status.INTERNAL,
      message: "Nie udało się zapisać zmian w pliku.",
    });
  }

  callback(null, updatedCategory);
}

module.exports = {
  listCategories,
  getCategoryById,
  addCategory,
  deletedCategory,
  UpdateCategory,

};