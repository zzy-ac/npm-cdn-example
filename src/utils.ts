import { BUILD_PATHS } from './constants';

export const findPathIndex = (origin: string) => {
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

export const parseName = (name: string) => {
  const isPrivate = name[0] === '@';
  const parse = isPrivate ? name.slice(1) : name;
  const [packageName, version] = parse.split('@');

  return {
    name: isPrivate ? `@${packageName}` : packageName,
    version
  }
}