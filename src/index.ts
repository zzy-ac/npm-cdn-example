import { app } from './app';
import { getPackage } from './cdn';

app.use("*", async (req, res) => {
  try {
    const { response, isRedirect } = await getPackage(req.originalUrl.slice(1));
    return isRedirect ? res.redirect(response) : res.send(response);
  } catch (e) {
    res.send('not a package');
  }
});