import { app } from './app';
import { BASE_URL } from './constants';
import { service } from './service';
import { TRegistry } from './types';
import { sendPackage } from './send-package';
import { findPathIndex, parseName } from './utils';

const dogSymbol = '%2540';

app.use('/health', (req, res) => {
  res.send('OK');
})

app.use('/npm/', async (req, res) => {
  const dogRex = new RegExp(dogSymbol, 'g');
  const url = req.originalUrl.replace(dogRex, '@').replace('/npm/', '');

  try {
    const pathIndex = findPathIndex(url);
    const paths = url.substr(pathIndex, url.length);
    const packagePath = url.substr(0, pathIndex);
    const { name, version } = parseName(packagePath);
    const instance = await service<TRegistry>(`${BASE_URL}/${name}`);

    if (name && !version) res.redirect(`/npm/${name}@${instance['dist-tags'].latest}${paths}`);
    else {
      const pack = instance.versions[version];
      if (pack) await sendPackage(res, pack, paths);
      else res.status(404).json({ userMessage: 'Package not found' });
    }
  } catch (err) {
    res.status(404).json({ userMessage: 'Package not found', developerMessage: err.message });
  }
});