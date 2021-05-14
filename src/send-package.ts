import path from 'path';
import fetch from 'node-fetch';
import * as tar from 'tar-stream';
import { createGunzip } from 'zlib';
import { createReadStream, existsSync, createWriteStream, mkdirSync, rmSync } from 'fs-extra';
import { Response } from 'express';

import { TVersion } from './types';
import { WRITE_PATH } from './constants';

const removeFileIfExists = (filePath: string) => {
  if (existsSync(filePath)) rmSync(filePath, { recursive: true });
}

export const sendPackage = async (res: Response, pack: TVersion, file: string) => {
  const filePath = `${WRITE_PATH}/${pack.name}/${pack.version}${file}`;
  const dirname = path.dirname(filePath);
  const fileName = path.basename(filePath);

  const onError = (err: Error) => {
    removeFileIfExists(filePath);
    res.status(404).json({ userMessage: `Cannot send ${fileName}`, developerMessage: err.message });
  }

  if (existsSync(filePath)) {
    createReadStream(filePath)
      .on('error', onError)
      .pipe(res);
  } else {
    const response = await fetch(pack.dist.tarball);

    if (!existsSync(dirname)) mkdirSync(dirname, { recursive: true });

    const gunzip = createGunzip();
    const extract = tar.extract();
    const writeStream = createWriteStream(filePath, { flags: 'w+' });

    gunzip.on('error', onError);

    writeStream.on('error', onError);

    extract.on('entry', (header, stream, next) => {
      stream.on('data', chunk => {
        const { name } = header;

        if (name.endsWith(file)) {
          writeStream.write(chunk);
          res.write(chunk);
        }
      });

      stream.on('end', () => next());

      stream.resume();
    });

    extract.on('error', onError)

    extract.on('finish', () => {
      writeStream.end();

      if (writeStream.bytesWritten) {
        res.end();
      } else {
        removeFileIfExists(filePath);
        res.status(404).json({ userMessage: `File ${fileName} not found` });
      }
    })

    response.body.pipe(gunzip).pipe(extract);
  }
};