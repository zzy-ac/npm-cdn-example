import { service } from './service';
import { TRegistry } from './types';
import { fileRead } from './file-read';
import { BASE_URL, BUILD_PATHS } from './constants';

const findPathIndex = (origin: string) => {
  let index = 0;

  for (let path of BUILD_PATHS) {
    const currentIndex = origin.search(path);

    if (currentIndex > 0) {
      index = currentIndex;
      break;
    }
  }

  return index;
}

const parseName = (name: string) => {
  const isPrivate = name[0] === '@';
  const parse = isPrivate ? name.slice(1) : name;
  const [packageName, version] = parse.split('@');

  return {
    name: isPrivate ? `@${packageName}` : packageName,
    version
  }
}

export const getPackage = async (origin: string) => {
  const pathIndex = findPathIndex(origin);
  const paths = origin.substr(pathIndex, origin.length);
  const packagePath = origin.substr(0, pathIndex);

  const { name, version } = parseName(packagePath);
  const instance = await service<TRegistry>(`${BASE_URL}/${name}`);

  if (name && !version)
    return {
      response: `/npm/${name}@${instance["dist-tags"].latest}${paths}`,
      isRedirect: true
    };

  return {
    response: await fileRead(instance.versions[version], paths),
    isRedirect: false
  }
};