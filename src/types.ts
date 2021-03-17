type TBin = {
  hist: string;
}

type TTags = {
  latest: string;
  next: string;
}

type TDist = {
  shasum: string;
  tarball: string;
}

type TVersion = {
  name: string,
  version: string,
  description: string,
  keywords: string[],
  main: string,
  bin: TBin,
  dist: TDist,
}

export type TRegistry = {
  'dist-tags': TTags;
  versions: Record<string, TVersion>;
}