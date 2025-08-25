import { useEffect, useRef, useState } from "react";
import { Button, Dialog, Text, XStack, YStack } from "tamagui";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const CFA_FORWARDER =
  "0xcfA132E353cB4E398080B9700609bb008eceB125" as const;
const GS_DEV_TOKEN =
  "0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475" as const;
const RECEIVER = "0x0000000000000000000000000000000000000001" as const;

const cfaForwarderAbi = [
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "sender", type: "address" },
      { name: "receiver", type: "address" },
      { name: "flowrate", type: "int96" },
      { name: "userData", type: "bytes" },
    ],
    name: "createFlow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export type VideoPlayerProps = {
  src: string;
};

export function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const confirmedRef = useRef(false);

  const TOKENS_PER_SECOND = 0.2 / 180 / 0.00011; // ~10.1 G$/sec
  const flowRateWei = parseEther(TOKENS_PER_SECOND.toFixed(3));

  const totalTokens = duration * TOKENS_PER_SECOND;

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

    const handlePlay = () => {
      console.log("play event triggered");
      if (!confirmedRef.current) {
        player.pause();
        setDialogOpen(true);
      }
    };

    player.on("loadedmetadata", () => {
      setDuration(player.duration());
    });

    player.on("play", handlePlay);

    // Ensure player is properly disposed
    return () => {
      player.off("play", handlePlay);
      player.dispose();
    };
  }, [src, loading]);

  const createFlow = async (flowRate: bigint) => {
    if (!address || !publicClient) return;

    const hash = await writeContractAsync({
      address: CFA_FORWARDER,
      abi: cfaForwarderAbi,
      functionName: "createFlow",
      args: [
        GS_DEV_TOKEN,
        address,
        RECEIVER,
        flowRate,
        "0x" as `0x${string}`,
      ],
    });

    await publicClient.waitForTransactionReceipt({ hash });
  };

  const handleConfirm = async () => {
    const player = playerRef.current;
    if (!player) return;
    await createFlow(flowRateWei);
    confirmedRef.current = true;
    setDialogOpen(false);
    player.play();
  };

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

      <Dialog modal open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content
            bordered
            elevate
            padding="$4"
            gap="$3"
            width="90%"
            maxWidth={400}
          >
            <Dialog.Title>Start Streaming</Dialog.Title>
            <YStack gap="$2">
              <Text>Video length: {Math.round(duration)} sec</Text>
              <Text>
                Rate: {TOKENS_PER_SECOND.toFixed(2)} G$/sec ({flowRateWei.toString()} wei/sec)
              </Text>
              <Text>Total: {totalTokens.toFixed(2)} G$</Text>
            </YStack>
            <XStack gap="$3" justifyContent="flex-end" marginTop="$2">
              <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
              <Button onPress={handleConfirm}>Start</Button>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
}
