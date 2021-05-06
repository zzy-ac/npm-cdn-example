import { app } from './app';
import { getPackage } from './cdn';

const dogSymbol = '%2540';

app.use('/health', (req, res) => {
  res.send('OK');
})

app.use("/npm/", async (req, res) => {
  const dogRex = new RegExp(dogSymbol, 'g');
  const url = req.originalUrl.replace(dogRex, '@').replace('/npm/', '');

  try {
    const { response, isRedirect } = await getPackage(url);
    return isRedirect ? res.redirect(response) : res.send(response);
  } catch ({ message }) {
    console.log(`Error, url(${url}): ${message}`);

    res.send('not a package');
  }
});