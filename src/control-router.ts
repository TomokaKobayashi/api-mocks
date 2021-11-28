// COPYRIGHT 2021 Kobayashi, Tomoka

import express from 'express';
import { ChangeDetector } from './types';

const addYamlHandler = (changeDetector: ChangeDetector) => {
    const addYaml =  (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if(req.headers['content-type']==='application/yaml'){
            const rawApi = req.body.toString();
            console.log(rawApi);
            res.status(200).send();
        }        
        // other content-type can't be accepted.
        res.status(400).send();
    };
    addYaml.target = changeDetector;
    return addYaml;
};

const removeYamlHandler = (changeDetector: ChangeDetector) =>{ 
    const removeYaml = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if(req.headers['content-type']==='application/json'){
            
            res.status(200).send();
        }        
        // other content-type can't be accepted.
        res.status(400).send();
    };
    removeYaml.target = changeDetector;
    return removeYaml;
};

export const controlRouter = (apiRoot: string, changeDetector: ChangeDetector) => {
    const rootRouter = express.Router();
    const router = express.Router();
    router.use(express.raw({type: 'application/yaml'}));
    router.use(express.json());
    router.post('/yamls', addYamlHandler(changeDetector));
    router.delete('/yamls', removeYamlHandler(changeDetector));
    rootRouter.use(apiRoot, router);
    return rootRouter;
};
