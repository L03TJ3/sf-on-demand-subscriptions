import { useEffect, useRef, useState } from "react";
import { Button, Dialog, Text, XStack, YStack } from "tamagui";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const CFA_FORWARDER = "0xcfA132E353cB4E398080B9700609bb008eceB125" as const;
const GS_DEV_TOKEN = "0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475" as const;
const RECEIVER = import.meta.env.VITE_STREAM_RECEIVER;

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
  const [transactionInProgress, setTransactionInProgress] = useState(false);

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
      args: [GS_DEV_TOKEN, address, RECEIVER, flowRate, "0x" as `0x${string}`],
    });

    await publicClient.waitForTransactionReceipt({ hash });
  };

  const handleConfirm = async () => {
    const player = playerRef.current;
    if (!player) return;
    setTransactionInProgress(true);
    try {
      await createFlow(flowRateWei);
      confirmedRef.current = true;
      setDialogOpen(false);
      player.play();
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <YStack width="100%">
      {loading ? (
        <YStack
          width="100%"
          height={300}
          backgroundColor="$background"
          alignItems="center"
          justifyContent="center"
          borderRadius="$6"
          borderWidth={2}
          borderColor="$borderColor"
          elevation="$1"
          shadowColor="$shadowColor"
        >
          <Text color="$color">Loading video player...</Text>
        </YStack>
      ) : (
        <YStack
          data-vjs-player
          width="100%"
          overflow="hidden"
          borderRadius="$6"
          borderWidth={2}
          borderColor="$borderColor"
          elevation="$1"
          shadowColor="$shadowColor"
        >
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered vjs-responsive"
            controls
            preload="auto"
            playsInline
            style={{ width: "100%", height: "100%" }}
          >
            <source src={src} type="video/mp4" />
          </video>
        </YStack>
      )}

      <Dialog modal open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay backgroundColor="$background" opacity={0.8} />
          <Dialog.Content
            bordered
            borderRadius="$6"
            backgroundColor="$background"
            borderWidth={2}
            borderColor="$borderColor"
            shadowColor="$shadowColor"
            elevation="$1"
            padding="$4"
            gap="$3"
            width="90%"
            maxWidth={400}
          >
            <Dialog.Title color="$borderColor">
              {transactionInProgress
                ? "Processing Transaction"
                : "Start Streaming"}
            </Dialog.Title>
            <YStack gap="$2">
              {transactionInProgress ? (
                <Text color="$color">
                  Please wait while the transaction is being processed...
                </Text>
              ) : (
                <>
                  <Text color="$color">
                    Video length: {Math.round(duration)} sec
                  </Text>
                  <Text color="$color">
                    Rate: {TOKENS_PER_SECOND.toFixed(2)} G$/sec
                  </Text>
                  <Text color="$color">Total: {totalTokens.toFixed(2)} G$</Text>
                </>
              )}
            </YStack>
            {!transactionInProgress && (
              <XStack gap="$3" justifyContent="flex-end" marginTop="$2">
                <Button
                  onPress={() => setDialogOpen(false)}
                  borderRadius="$6"
                  borderWidth={2}
                  borderColor="$borderColor"
                  color="$color"
                  // elevation="$1"
                  // animation="fast"
                  hoverStyle={{ backgroundColor: "$backgroundHover" }}
                  pressStyle={{ backgroundColor: "$backgroundPress" }}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleConfirm}
                  borderRadius="$6"
                  borderWidth={2}
                  borderColor="$borderColor"
                  backgroundColor="$borderColor"
                  color="$background"
                  // elevation="$1"
                  // animation="fast"
                  hoverStyle={{ backgroundColor: "$borderColorHover" }}
                  pressStyle={{ backgroundColor: "$borderColorHover" }}
                >
                  Start
                </Button>
              </XStack>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
}
