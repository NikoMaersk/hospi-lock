import { routes } from './endpoints/routes';
require('dotenv').config()

const port = 3000;

routes.listen(port, () =>{
    console.log('This server is listening at port:' + port);
});

