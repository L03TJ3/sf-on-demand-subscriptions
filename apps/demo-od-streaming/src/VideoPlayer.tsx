import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export type VideoPlayerProps = {
  src: string;
};

export function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const player = (playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "auto",
        sources: [{ src, type: "video/mp4" }],
      }));

      let confirmed = false;

      player.on("play", () => {
        if (!confirmed) {
          player.pause();
          player.trigger("sfPlayRequest");
        }
      });

      player.on("sfPlayRequest", () => {
        if (window.confirm("Start playing the video?")) {
          confirmed = true;
          player.play();
        }
      });
    }

    return () => {
      playerRef.current?.dispose();
    };
  }, [src]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
}
