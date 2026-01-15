const { app } = require('@azure/functions');


require("./src/functions/CreateMedia");
require("./src/functions/GetMedia");
require("./src/functions/UpdateMedia");
require("./src/functions/DeleteMedia");
require("./src/functions/HelloFunction");
