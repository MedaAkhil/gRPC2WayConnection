const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protobuf
const packageDefinition = protoLoader.loadSync('chat.proto', {});
const proto = grpc.loadPackageDefinition(packageDefinition).ChatService;

// Chat server logic
function chat(call) {
  console.log("Client connected");
  call.on('data', (message) => {
    console.log(`Received: ${message.user}: ${message.message}`);

    // Broadcast the message to the same client
    call.write({
      user: "Server",
      message: `Echo: ${message.message}`
    });
  });

  call.on('end', () => {
    console.log("Client disconnected");
    call.end();
  });
}

// Start the gRPC server
const server = new grpc.Server();
server.addService(proto.service, { Chat: chat });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running at http://0.0.0.0:50051');
  server.start();
});
