import fetch from 'node-fetch';
import * as tar from 'tar-stream';
import { createGunzip } from 'zlib';
import * as fs from 'fs-extra';

import { TVersion } from './types';
import { WRITE_PATH } from './constants';

const getFile = async (name: string) => {
  try {
    const buffer = await fs.readFile(`${WRITE_PATH}${name}`);
    console.log(`read file ${name}`);

    return buffer.toString();
  } catch ({ message }) {
    console.log(`read file ${name}, error: ${message}`);
    return null;
  }
}

const writeFile = async (name: string, data: string) => {
  try {
    const file = await fs.outputFile(`${WRITE_PATH}${name}`, data);
    console.log(`write file ${name}`);

    return file;
  } catch ({ message }) {
    console.log(`write file ${name}, error: ${message}`);
  }
}


export const fileRead = (pack: TVersion, file: string) => new Promise<string>(async resolve => {
  const filePath = `/${pack.name}/${pack.version}${file}`;
  const cacheFile = await getFile(filePath);

  if (cacheFile) return resolve(cacheFile);

  const response = await fetch(pack.dist.tarball);
  const extract = tar.extract();

  let data = '';

  extract.on('entry', (header, stream, cb) => {
    stream.on('data', chunk => {
      const { name } = header;
      if (name.endsWith(file)) data += chunk;
    });

    stream.on('end', () => cb());

    stream.resume();
  });

  extract.on('finish', () => {
    if (data) writeFile(filePath, data);
    resolve(data);
  });

  response.body.pipe(createGunzip()).pipe(extract);
})