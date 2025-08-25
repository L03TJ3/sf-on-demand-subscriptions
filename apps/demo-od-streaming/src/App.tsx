import { YStack, XStack, Image, Text, Button } from "tamagui";
import { useAccount } from "wagmi";
import { mockVideos, Video } from "./videos";
import { VideoPlayer } from "./VideoPlayer";
import { useState } from "react";

function renderVideo(video: Video, onSelect: (v: Video) => void) {
  return (
    <Button
      key={video.id}
      onPress={() => onSelect(video)}
      borderRadius="$6"
      padding={10}
      overflow="hidden"
      height="100px"
      borderWidth={2}
      borderColor="$borderColor"
      // animation="fast"
      hoverStyle={{ backgroundColor: "$backgroundHover" }}
      pressStyle={{ backgroundColor: "$backgroundPress" }}
    >
      <Image source={{ uri: video.thumbnail }} width={160} height={90} />
    </Button>
  );
}

function ConnectSection() {
  return (
    <YStack
      gap="$4"
      alignItems="center"
      justifyContent="center"
      theme="dark_neon"
      // animation="medium"
    >
      <Text color="$color">Connect your wallet to view videos</Text>
      {/* AppKit provides the connect button as a web component */}
      <appkit-button />
    </YStack>
  );
}

function VideoGallery({ onSelect }: { onSelect: (v: Video) => void }) {
  return (
    <XStack
      flexWrap="wrap"
      gap="$4"

      // animation="medium"
    >
      {mockVideos.map((v) => renderVideo(v, onSelect))}
    </XStack>
  );
}

function VideoPage({ video, onBack }: { video: Video; onBack: () => void }) {
  return (
    <YStack gap="$4" alignItems="center" width="100%">
      <VideoPlayer src={video.src} />
      <Button
        onPress={onBack}
        borderRadius="$6"
        borderWidth={2}
        borderColor="$borderColor"
        elevation={"$1"}
        // animation="fast"
        hoverStyle={{ backgroundColor: "$backgroundHover" }}
        pressStyle={{ backgroundColor: "$backgroundPress" }}
      >
        <Text color="$color">Back</Text>
      </Button>
    </YStack>
  );
}

export default function App() {
  const { isConnected } = useAccount();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  return (
    <YStack
      flex={1}
      padding="$4"
      alignItems="center"
      justifyContent="center"
      width={1200}
    >
      {isConnected ? (
        selectedVideo ? (
          <VideoPage
            video={selectedVideo}
            onBack={() => setSelectedVideo(null)}
          />
        ) : (
          <VideoGallery onSelect={setSelectedVideo} />
        )
      ) : (
        <ConnectSection />
      )}
    </YStack>
  );
}
