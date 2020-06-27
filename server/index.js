const path = require('path');

const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

//kenx

// const enviroment = process.env.ENVIROMENT || 'development';
const enviroment = 'development';

const config = require('./knexfile.js')[enviroment];
const knex = require('knex')(config);

const productProtoPath = path.join(__dirname,'..','protos','product.proto');
const productProtoDefinition = protoLoader.loadSync(productProtoPath);

const productPackageDefintion = grpc.loadPackageDefinition(productProtoDefinition).product;

function listProducts(call, callback) {}
function readProduct(call, callback) {}
function createProduct(call, callback) {}
function updateProduct(call, callback) {}
function deleteProduct(call, callback) {}


function main() {
    const server = new grpc.Server();

    server.addService(productPackageDefintion.ProductService.service, {
        listProducts : listProducts,
        readProduct: readProduct,
        createProduct: createProduct,
        updateProduct: updateProduct,
        deleteProduct,deleteProduct,
    });

    server.bind('localhost:50051', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('gRPC server running at localhost:50051')

}

function listProducts(call, callback) {
    /*
    Using 'grpc.load'? Send back an array: 'callback(null, { data });'
    */
    knex('products')
      .then((data) => { callback(null, { products: data }); });
  }

  function readProduct(call, callback) {
    knex('products')
      .where({ id: parseInt(call.request.id) })
      .then((data) => {
        if (data.length) {
          callback(null, data[0]);
        } else {
          callback('That product does not exist');
        }
      });

  }

  function createProduct(call,callback){
    knex('products').insert({
        name: call.request.name,
        price: call.request.price,
    }).then(()=>{callback(null,{status:'success'})})
}
function updateProduct(call,callback) {
    knex('products')
    .where({id: parseInt(call.request.id)})
    .update({
        name:call.request.name,
        price:call.request.price,
    })
    .returning()
    .then((data)=>{
        if(data){
            callback(null,{status:'success'});
        }
        else{
            callback('that product does not exist')
        }
    })
}

function deleteProduct(call, callback){
    knex('products')
    .where({id:parseInt(call.request.id)})
    .delete()
    .returning()
    .then((data)=>{
        if(data){
            callback(null,{status:'success'});
        }else{
            callback('That product does not exist')
        }
    })
}


main();