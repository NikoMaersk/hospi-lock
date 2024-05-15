"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("./endpoints/routes");
const port = 3000;
routes_1.routes.listen(port, () => {
    console.log('This server is listening at port:' + port);
});
//# sourceMappingURL=app.js.map