import { routes } from './endpoints/routes';

const port = 3000;

routes.listen(port, () =>{
    console.log('This server is listening at port:' + port);
});

