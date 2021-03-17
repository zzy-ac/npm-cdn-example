import fetch from 'node-fetch';

export const service = async <T extends any>(path: string): Promise<T> => {
  const response = await fetch(path);

  return response.json();
};