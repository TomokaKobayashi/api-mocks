// COPYRIGHT Kobayashi, Tomoka 2021
import express from 'express';

const addYaml = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    next();
};

const removeYaml = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    next();
};

export const controlRouter = (apiRoot: string) => {
    const rootRouter = express.Router();
    const router = express.Router();
    router.post('/yamls', addYaml);
    router.delete('/yamls', removeYaml);
    rootRouter.use(apiRoot, router);
};
