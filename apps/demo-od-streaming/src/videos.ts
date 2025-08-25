export type Video = {
  id: number;
  thumbnail: string;
  src: string;
};

export const mockVideos: Video[] = [
  { id: 1, thumbnail: "/assets/test1.jpg", src: "/assets/sample.mp4" },
  { id: 2, thumbnail: "/assets/test1.jpg", src: "/assets/sample.mp4" },
  { id: 3, thumbnail: "/assets/test1.jpg", src: "/assets/sample.mp4" },
];
