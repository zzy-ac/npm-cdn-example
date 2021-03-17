import * as express from 'express';

export const app = express();

const port = process.env.PORT || 9000;
app.listen(port);
