const Service = require('node-windows').Service;

const svc = new Service({
  name: 'PdfRenderService',
  script: require('path').join(__dirname, 'server.js'),
});

svc.on('uninstall', () => {
  console.log('Service uninstalled');
});

svc.on('alreadyuninstalled', () => {
  console.log('Service was not installed - nothing to remove');
});

svc.uninstall();
