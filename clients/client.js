const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { error } = require("console");
const path = require("path");


const PROTO_PATH = path.join(__dirname, "../proto/service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const services = protoDescriptor.services;

const client = new services.CategoryService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
const clientProd = new services.ProductService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const clientSuppl = new services.SupplierService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

function roundToTwo(num) {
  return parseFloat(num.toFixed(2));
}
function fetchGetCategoryById(id_category){
// Przykład wywołania GetCategoryById
client.GetCategoryById({ id_category: id_category }, (error, response) => {
  if (error) {
    console.error("Błąd serwera:", error.message);
  } else {
    console.log("Kategoria znaleziona:", response);
  }
});
}

function fetchFullProductById(id){
// Przykład wywołania GetProductById z zaokrągleniem na kliencie
clientProd.getFullProductById({ id: id }, (error, response) => {
  if (error) {
    console.error("Błąd serwera:", error.message);
  } else {
    // Przetwarzanie odpowiedzi w celu zaokrąglenia floatów
    const formattedResponse = {
      ...response,
      nutritional_values: {
        carbohydrates: roundToTwo(response.nutritional_values.carbohydrates),
        proteins: roundToTwo(response.nutritional_values.proteins),
        fats: roundToTwo(response.nutritional_values.fats),
      },
      id_supplier: {
        ...response.id_supplier,
        rating: roundToTwo(response.id_supplier.rating),
      },
    };

    console.log("\nPełen Produkt znaleziono:\n", JSON.stringify(formattedResponse, null, 2));
  }
});
}

function fetchGetProductById(id){
clientProd.GetProductById({ id: id }, (error, response) => {
  if (error) {
    console.error("Błąd serwera:", error.message);
  } else {

    // Przetwarzanie odpowiedzi w celu zaokrąglenia floatów
    const formattedResponse = {
      id: response.id, 
      name: response.name,
      category_id: response.category_id,
      id_supplier: response.id_supplier,
      nutritional_values: {
        carbohydrates: roundToTwo(response.nutritional_values.carbohydrates),
        proteins: roundToTwo(response.nutritional_values.proteins),
        fats: roundToTwo(response.nutritional_values.fats),
      },
    };

    console.log("\nProdukt znaleziony:\n", JSON.stringify(formattedResponse, null, 2));
  }
});
}


function fetchListProduct(filters){
  clientProd.ListProducts(filters, (error, response) => {
    if (error) {
      console.error("Błąd serwera:", error.message);
    } else {
      console.log("\nProdukty po filtrowaniu i paginacji:");
      const formattedProducts = response.products.map(product => ({
        id: product.id,
        name: product.name,
        nutritional_values: {
          carbohydrates: roundToTwo(product.nutritional_values.carbohydrates),
          proteins: roundToTwo(product.nutritional_values.proteins),
          fats: roundToTwo(product.nutritional_values.fats),
        }
      }));
      console.log(` dlugosc: ${formattedProducts.length}`)
      console.log(JSON.stringify(formattedProducts, null, 2));
    }
  });
}

function fetchAddPrduct(newProduct){
  clientProd.addProduct(newProduct, (error, response) => {
    if (error) {
      console.error("Błąd podczas dodawania produktu:", error.message);
    } else {
      const formattedResponse = {
        id: response.id, 
        name: response.name,
        category_id: response.category_id,
        id_supplier: response.id_supplier,
        nutritional_values: {
          carbohydrates: roundToTwo(response.nutritional_values.carbohydrates),
          proteins: roundToTwo(response.nutritional_values.proteins),
          fats: roundToTwo(response.nutritional_values.fats),
        },
      };

      console.log("Nowy produkt został dodany:", JSON.stringify(formattedResponse, null,2));
    }
  });
}

function fetchDeleteProduct(deleteProduct){
  clientProd.deletedProduct({id:deleteProduct}, (error, response)=>{
    if (error) {
      console.error("Błąd podczas usuwania produktu:", error.message);
    } else {
      console.log("produkt został usuniety:", response);
    }
  });
}

function fetchUpdateProduct(id, updates) {
  clientProd.UpdateProduct({ id, ...updates }, (error, response) => {
    if (error) {
      console.error("Błąd podczas aktualizacji produktu:", error.message);
    } else {
      console.log("Produkt zaktualizowany:", response);
    }
  });
}

function fetchAddCategory(newCategory){
  client.addCategory(newCategory, (error,response) =>{
    if(error){
      console.log('Błąd podczas dodawania kategorii ', error.message);
    }else{
      const formattedResponse ={
        id: response.id,
        name: response.name,
        main_category: response.main_category,
        description: response.description
      };
      console.log(" Nowa kategoria dodana:", JSON.stringify(formattedResponse, null,2));
    }
  });
}

function fechDeleteCategory(deleteCategory){
  client.deletedCategory({id_category:deleteCategory}, (error, response) =>{
    if (error) {
      console.error("Błąd podczas usuwania kategrii:", error.message);
    } else {
      console.log("kategria została usunieta:", response);
    }
  });
}

function fetchUpdateCategory(id_category, updateCategory){
  client.updateCategory({id_category, ...updateCategory}, (error, response) =>{
    if (error) {
      console.error("Błąd podczas aktualizacji kategorii:", error.message);
    } else {
      console.log("Kategoria zaktualizowany:", response);
    }
  });
}

function fetchAddSupplier(newSuppl){
  clientSuppl.addSupplier(newSuppl, (error, response) =>{
    if(error){
      console.log("Blad podczas dodoawnia kategorii", error.message);
    }else{
      const formattedResponse = {
        id_supplier: response.id_supplier,
        name: response.name,
        contact_info:{
          address: response.contact_info.address,
          phone: response.contact_info.phone
        },
        rating: roundToTwo(response.rating)
      };
      console.log("Nowy dostawca zostla dodany", JSON.stringify(formattedResponse, null, 2));
    }
  });
}

function fetchDeleteSupplier(delteSupplier){
  clientSuppl.deletedSupplier({id_supplier: delteSupplier}, (error,response)=>{
    if (error) {
      console.error("Błąd podczas usuwania dostawcy:", error.message);
    } else {
      console.log("Dostawca został usuniety:", response);
    }
  });
}

function fetchUpdateSupplier(id_supplier, updateSupplier){
  clientSuppl.updateSupplier({id_supplier, ...updateSupplier}, (error,response)=>{
    if (error) {
      console.error("Błąd podczas aktualizacji dostawcy:", error.message);
    } else {
      console.log("Dostawca zaktualizowany:", response);
    }
  });
}
function fetchListSuppliers(filters = {}) {
  clientSuppl.listSuppliers(filters, (error, response) => {
    if (error) {
      console.error("Błąd serwera:", error.message);
    } else {
      console.log("\nDostawcy po filtrowaniu i sortowaniu:");

      const formattedSuppliers = response.suppliers.map(supplier => ({
        id_supplier: supplier.id_supplier,
        name: supplier.name,
        contact_info: {
          address: supplier.contact_info.address,
          phone: supplier.contact_info.phone,
        },
        rating: roundToTwo(supplier.rating),
      }));

      console.log(`Liczba dostawców: ${formattedSuppliers.length}`);
      console.log(JSON.stringify(formattedSuppliers, null, 2));
    }
  });
}

/////////////////////////////
const filters = {
 
  max_carbohydrates: 5,
  max_proteins: 2,
  min_proteins: 1,  
  limit: 20,  
  sort_by: "nutritional_values.carbohydrates" ,
  sort_order: "desc"
         
};
//fetchListProduct(filters);

// Dodawanie nowego produktu
const newProduct = {
  name: "Nowy produkt",
  category_id: 103, // ID istniejącej kategorii
  supplier_id: 24, // ID istniejącego dostawcy
  nutritional_values: {
    carbohydrates: roundToTwo(2.5),
    proteins: roundToTwo(1.4),
    fats: roundToTwo(1.2),
  },
};

//fetchAddPrduct(newProduct);


//fetchDeleteProduct(104);

/*
fetchUpdateProduct(103,{
  name: "dziala",
  category_id: 101,
  id_supplier: 80, 
  nutritional_values:{
    fats: 10,
    carbohydrates: 5,
    proteins: 5
  }
})
*/

//fetchGetProductById(100);
//fetchGetProductById(103);
//fetchFullProductById(101);
//fetchGetCategoryById(105);

newCategory = {
  name: "niwa kategoria",
  main_category: " glowna kateogira",
  description:" opis kateogrii"
}

//fetchAddCategory(newCategory);
//fechDeleteCategory(7);

/*
fetchUpdateCategory(7, {
  name: " NOWA NOWA KATEGORIA",
  main_category: "NOWA glowan kategoria"
});
*/

newSuppl ={
  name: "nowy dostawca",
  contact_info:{
    address: "nowa ulica ",
    phone: "123456789"
  },
  rating: 2.1
}

//fetchAddSupplier(newSuppl)
//fetchDeleteSupplier(104)
/*
fetchUpdateSupplier(104, {
  name: " zaktualiozwnay dostawca",
  contact_info:{
    address: " jeszcze nowszy adres"
  },
  rating: roundToTwo(3.7)
});
*/


// do fetchListSuppliers : { min_rating: 2, max_rating: 4 } lub  min_rating: 2, max_rating: 4 , sort_by: "rating", sort_order: "asc"} , pusta zwraca cala baze
fetchListSuppliers({ min_rating: 2, max_rating: 4 , sort_by: "rating", sort_order: "asc"});

