const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const fs = require("fs");


const { listProducts, getFullProductById, GetProductById, addProduct, deletedProduct, UpdateProduct } = require("../resolvers/productResolver");
const { listSuppliers, getSupplierById } = require("../resolvers/supplierResolver");
const { listCategories, getCategoryById } = require("../resolvers/categoryResolver");

const PROTO_PATH = path.join(__dirname, "../proto/service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const services = grpc.loadPackageDefinition(packageDefinition).services;
/*
function GetCategoryById(call, callback) {
  const id = call.request.id_category;
  const category = categories.find((cat) => cat.id_category === id);

  if (!category) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Kategoria z ID ${id} nie istnieje.`,
    });
  }

  callback(null, category);
}

function ListCategories(call, callback) {
  callback(null, { categories });
}
*/

function main() {
  const server = new grpc.Server();
  server.addService(services.CategoryService.service, {
    listCategories,
    getCategoryById
  });

  server.addService(services.ProductService.service,{
    listProducts,
    getFullProductById,
    GetProductById,
    addProduct,
    deletedProduct,
    UpdateProduct,
  })

  server.addService(services.SupplierService.service, {
    listSuppliers,
    getSupplierById
  })

  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Serwer działa na porcie 50051");

  });
}

main();