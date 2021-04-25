var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'PRINTER_SERVER',
  description: 'Node.js printer server',
  script: 'D:\\POS_SERVER\\index.js',
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "DB_PATH",
      value: "",
    },
    {
      name: "API_KEY",
      value: "",
    },
    {
      name: "API_URL",
      value: "",
    },
    {
      name: "CAT_ID_BAR",
      value: "",
    },
    {
      name: "CAT_ID_REST",
      value: "",
    },
    {
      name: "PRINTER_IP_BAR",
      value: "",
    },
    {
      name: "PRINTER_IP_REST",
      value: "",
    },
    {
      name: "PRINTER_TIMEOUT",
      value: "",
    },
    {
      name: "SERVER_PORT",
      value: "",
    },
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
