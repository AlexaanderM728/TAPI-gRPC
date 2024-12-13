const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
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

// Przykład wywołania GetCategoryById
client.GetCategoryById({ id_category: 101 }, (error, response) => {
  if (error) {
    console.error("Błąd serwera:", error.message);
  } else {
    console.log("Kategoria znaleziona:", response);
  }
});

// Przykład wywołania ListCategories
/*client.ListCategories({}, (error, response) => {
  if (error) {
    console.error("Błąd serwera:", error.message);
  } else {
    console.log("Kategorie:", response.categories);
  }
});*/