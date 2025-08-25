export type Video = {
  id: number;
  thumbnail: string;
};

export const mockVideos: Video[] = [
  { id: 1, thumbnail: 'https://placekitten.com/320/180' },
  { id: 2, thumbnail: 'https://placekitten.com/321/180' },
  { id: 3, thumbnail: 'https://placekitten.com/322/180' }
];
