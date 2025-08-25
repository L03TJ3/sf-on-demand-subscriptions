import { YStack, XStack, Image, Text } from "tamagui";
import { useAccount } from "wagmi";
import { mockVideos, Video } from "./videos";

const GS_DEV_TOKEN = "0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475";

function renderVideo(video: Video) {
  return (
    <Image
      key={video.id}
      source={{ uri: video.thumbnail }}
      width={160}
      height={90}
      borderRadius={8}
    />
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

function VideoGallery() {
  return (
    <XStack flexWrap="wrap" gap="$4" animation="medium">
      {mockVideos.map(renderVideo)}
    </XStack>
  );
}

export default function App() {
  const { isConnected } = useAccount();
  return (
    <YStack flex={1} padding="$4" alignItems="center" justifyContent="center">
      {isConnected ? <VideoGallery /> : <ConnectSection />}
    </YStack>
  );
}
