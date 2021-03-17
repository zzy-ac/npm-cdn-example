import fetch from 'node-fetch';
import * as tar from 'tar-stream';
import { createGunzip } from 'zlib';

export const fileRead = (filePath: string, file: string) => new Promise<string>(async resolve => {
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

  extract.on('finish', () => resolve(data));

  response.body.pipe(createGunzip()).pipe(extract);
})