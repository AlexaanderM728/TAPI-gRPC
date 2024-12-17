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
      console.log("Nowy produkt został dodany:", response);
    }
  });
}


const filters = {
 
  max_carbohydrates: 5,
  max_proteins: 2,
  min_proteins: 1,  
  limit: 10,         
         
};
fetchListProduct(filters);

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

//fetchGetProductById(100);
//fetchGetProductById(103);
//fetchFullProductById(101);
//fetchGetCategoryById(105);

// Przykład wywołania ListCategories
/*client.ListCategories({}, (error, response) => {
  if (error) {
    console.error("Błąd serwera:", error.message);
  } else {
    console.log("Kategorie:", response.categories);
  }
});*/