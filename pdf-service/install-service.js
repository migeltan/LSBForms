const Service = require("node-windows").Service;

const svc = new Service({
  name: "PdfRenderService",
  description: "PDF rendering service for hob internal security group",
  script: require("path").join(__dirname, "server.js"),
});

svc.on("install", () => {
  svc.start();
  console.log("Service installed and started");
});

svc.on("alreadyinstalled", () => {
  console.log("Service was already installed");
});

svc.install();
