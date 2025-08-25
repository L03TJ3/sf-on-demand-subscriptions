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
      padding={0}
      overflow="hidden"
      width={200}
      height={140}
      borderWidth={2}
      borderColor="$borderColor"
      elevation={"$1"}
      hoverStyle={{ backgroundColor: "$backgroundHover" }}
      pressStyle={{ backgroundColor: "$backgroundPress" }}
      style={{ boxShadow: "0 0 8px rgba(168,85,247,0.3)" }}
    >
      <YStack width="100%" height="100%">
        <YStack position="relative" flex={1}>
          <Image
            source={{ uri: video.thumbnail }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
          <Text
            position="absolute"
            bottom={4}
            left={4}
            paddingHorizontal={4}
            borderRadius={4}
            backgroundColor="$background"
            color="$color"
          >
            {video.price} G$
          </Text>
        </YStack>
        <YStack padding={6}>
          <Text color="$color" fontSize="$3">
            {video.title}
          </Text>
        </YStack>
      </YStack>
    </Button>
  );
}

function ConnectSection() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Text color="$color">Connect your wallet to view videos</Text>
    </YStack>
  );
}

function VideoGallery({ onSelect }: { onSelect: (v: Video) => void }) {
  return (
    <XStack flexWrap="wrap" gap="$4">
      {mockVideos.map((v) => renderVideo(v, onSelect))}
    </XStack>
  );
}

function VideoPage({ video, onBack }: { video: Video; onBack: () => void }) {
  return (
    <YStack gap="$4" alignItems="center" width={800}>
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

function GalleryTabs({
  tab,
  setTab,
}: {
  tab: string;
  setTab: (t: string) => void;
}) {
  const tabs = ["Trending", "New", "Live", "4x"];
  return (
    <XStack gap="$4" marginBottom="$4">
      {tabs.map((t) => (
        <Button
          key={t}
          onPress={() => setTab(t)}
          borderRadius="$6"
          borderWidth={1}
          borderColor={tab === t ? "$borderColor" : "transparent"}
          backgroundColor="$background"
          hoverStyle={{ backgroundColor: "$backgroundHover" }}
          pressStyle={{ backgroundColor: "$backgroundPress" }}
        >
          <Text color="$color">{t}</Text>
        </Button>
      ))}
    </XStack>
  );
}

function Sidebar() {
  return (
    <YStack
      width={320}
      padding="$4"
      borderRightWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      gap="$4"
    >
      <appkit-button />
      <Button
        disabled
        borderRadius="$6"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$background"
      >
        <Text color="$color">Usage</Text>
      </Button>
    </YStack>
  );
}

export default function App() {
  const { isConnected } = useAccount();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [tab, setTab] = useState("Trending");
  return (
    <XStack flex={1} width="100%" height="100vh">
      <Sidebar />
      <YStack flex={1} padding="$4" gap="$4">
        {isConnected ? (
          selectedVideo ? (
            <VideoPage
              video={selectedVideo}
              onBack={() => setSelectedVideo(null)}
            />
          ) : (
            <>
              <GalleryTabs tab={tab} setTab={setTab} />
              <VideoGallery onSelect={setSelectedVideo} />
            </>
          )
        ) : (
          <ConnectSection />
        )}
      </YStack>
    </XStack>
  );
}
