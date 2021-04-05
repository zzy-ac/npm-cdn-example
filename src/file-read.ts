import fetch from 'node-fetch';
import fs from 'fs-extra';
import * as tar from 'tar-stream';
import { createGunzip } from 'zlib';

import { BASE_URL } from './constants';

const getPath = (name: string) => name.replace(BASE_URL, '').replace('.tgz', '.js');

const getFile = async (name: string) => {
  try {
    const buffer = await fs.readFile(`src/cache${getPath(name)}`);
    return buffer.toString();
  } catch (e) {
    return null;
  }
}

const writeFile = async (name: string, file: string) => {
  try {
    return await fs.outputFile(`src/cache${getPath(name)}`, file);
  } catch (e) {
    return null;
  }
}

export const fileRead = (filePath: string, file: string) => new Promise<string>(async resolve => {
  const cacheFile = await getFile(filePath);

  if (cacheFile) return resolve(cacheFile);

  const response = await fetch(filePath);
  const extract = tar.extract();

  let data = '';

  extract.on('entry', (header, stream, cb) => {
    stream.on('data', chunk => {
      if (header.name.includes(file)) data += chunk;
    });

    stream.on('end', () => cb());

    stream.resume();
  });

  extract.on('finish', () => {
    writeFile(filePath, data);
    resolve(data);
  });

  response.body.pipe(createGunzip()).pipe(extract);
})