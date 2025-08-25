import { YStack, XStack, Image, Text, Button } from "tamagui";
import { useAccount } from "wagmi";
import { mockVideos, Video } from "./videos";
import { VideoPlayer } from "./VideoPlayer";
import { useState } from "react";

const GS_DEV_TOKEN = "0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475";

function renderVideo(video: Video, onSelect: (v: Video) => void) {
  return (
    <Button key={video.id} onPress={() => onSelect(video)} unstyled>
      <Image
        source={{ uri: video.thumbnail }}
        width={160}
        height={90}
        borderRadius={8}
      />
    </Button>
  );
}

function ConnectSection() {
  return (
    <YStack
      gap="$4"
      alignItems="center"
      justifyContent="center"
      animation="medium"
    >
      <Text>Connect your wallet to view videos</Text>
      {/* AppKit provides the connect button as a web component */}
      <appkit-button />
    </YStack>
  );
}

function VideoGallery({ onSelect }: { onSelect: (v: Video) => void }) {
  return (
    <XStack flexWrap="wrap" gap="$4" animation="medium">
      {mockVideos.map((v) => renderVideo(v, onSelect))}
    </XStack>
  );
}

function VideoPage({ video, onBack }: { video: Video; onBack: () => void }) {
  return (
    <YStack gap="$4" alignItems="center">
      <Button onPress={onBack}>Back</Button>
      <VideoPlayer src={video.src} />
    </YStack>
  );
}

export default function App() {
  const { isConnected } = useAccount();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  return (
    <YStack flex={1} padding="$4" alignItems="center" justifyContent="center">
      {isConnected ? (
        selectedVideo ? (
          <VideoPage video={selectedVideo} onBack={() => setSelectedVideo(null)} />
        ) : (
          <VideoGallery onSelect={setSelectedVideo} />
        )
      ) : (
        <ConnectSection />
      )}
    </YStack>
  );
}
