import fetch from 'node-fetch';
import * as tar from 'tar-stream';
import { createGunzip } from 'zlib';
import {createReadStream, existsSync, createWriteStream, mkdirSync} from 'fs-extra';
import {Request, Response} from 'express';

import { TVersion } from './types';
import { WRITE_PATH } from './constants';

function sleep(ms) {
  ms += new Date().getTime();
  while (new Date() < ms){}
}

export const fileRead = async (res: Response, pack: TVersion, file: string, req: Request) => {
  console.log(pack);
  const filePath = `/${pack.name}/${pack.version}${file}`;
  const path = `${WRITE_PATH}${filePath}`;
  const filePathWithoutName = path.split('/');

  if (existsSync(path)) {
    createReadStream(path).pipe(res);
    console.log(`read file ${filePath}`);
  } else {
    const response = await fetch(pack.dist.tarball);

    mkdirSync(filePathWithoutName.slice(0, filePathWithoutName.length - 1).join('/'), { recursive: true });

    const extract = tar.extract();

    const writeStream = createWriteStream(path, { flags: 'w+' });

    extract.on('entry', (header, stream, next) => {
      stream.on('data', chunk => {
        const { name } = header;

        if (name.endsWith(file)) {
          sleep(2)
          console.log(req.headers["user-agent"]);


          writeStream.write(chunk);
          res.write(chunk);
        }
      });

      stream.on('end', () => next());

      stream.on('error', () => res.send('not a package'));

      stream.resume();
    });

    extract.on('finish', () => {
      writeStream.end();
      res.end();
      console.log('end')
    })

    response.body.pipe(createGunzip()).pipe(extract);

    console.log(`read file ${filePath}, not read`);
  }
};