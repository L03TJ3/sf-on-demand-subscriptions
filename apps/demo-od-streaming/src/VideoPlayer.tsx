import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export type VideoPlayerProps = {
  src: string;
};

export function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [videoRef]);

  useEffect(() => {
    const videoEl = videoRef.current;

    if (!videoEl || !document.body.contains(videoEl)) return;

    // Check if the player is already initialized
    let player = playerRef.current;
    if (!player) {
      player = videojs(videoEl, {
        controls: true,
        preload: "auto",
        fluid: true,
      });
      playerRef.current = player;
    }

    player.ready(() => {
      player.src({ src, type: "video/mp4" });
      player.controls(true); // Ensure controls are enabled
    });

    let confirmed = false;

    const handlePlay = () => {
      console.log("play event triggered");
      if (!confirmed) {
        player.pause();
        player.trigger("sfPlayRequest");
      }
    };

    const handleRequest = () => {
      if (window.confirm("Start playing the video?")) {
        confirmed = true;
        player.play();
      }
    };

    player.on("play", handlePlay);
    player.on("sfPlayRequest", handleRequest);

    // Ensure player is properly disposed
    return () => {
      player.off("play", handlePlay);
      player.off("sfPlayRequest", handleRequest);
      player.dispose();
    };
  }, [src, loading]);

  return (
    <div style={{ width: "100%" }}>
      {loading ? (
        <div
          style={{
            width: "100%",
            height: 300,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          Loading video player...
        </div>
      ) : (
        <div data-vjs-player style={{ width: "100%", height: 300 }}>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            controls
            preload="auto"
            playsInline
            style={{ width: "100%", height: "300px", backgroundColor: "#000" }}
          >
            <source src={src} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}
