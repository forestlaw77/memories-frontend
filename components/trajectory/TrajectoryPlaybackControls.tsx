/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { TrajectoryPoint } from "@/hooks/useTrajectoryPoints";
import {
  Box,
  Button,
  createListCollection,
  HStack,
  Portal,
  Select,
  Slider,
} from "@chakra-ui/react";

const playbackIntervalMap = createListCollection({
  items: [
    { label: "0.5 sec/image", value: "500" },
    { label: "1 sec/image", value: "1000" },
    { label: "2 sec/image", value: "2000" },
    { label: "5 sec/image", value: "5000" },
  ],
});

interface TrajectoryPlaybackControlsProps {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  trajectoryPoints: TrajectoryPoint[];
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  playbackInterval: number;
  setPlaybackInterval: (interval: number) => void;
  hasTrajectoryPoints: boolean;
}

export const TrajectoryPlaybackControls = ({
  currentIndex,
  setCurrentIndex,
  trajectoryPoints,
  isPlaying,
  setIsPlaying,
  playbackInterval,
  setPlaybackInterval,
  hasTrajectoryPoints,
}: TrajectoryPlaybackControlsProps) => {
  return (
    <Box>
      <Slider.Root
        variant="solid"
        min={0}
        max={hasTrajectoryPoints ? trajectoryPoints.length - 1 : 0}
        value={[currentIndex]}
        onValueChange={(e) => {
          const index = Array.isArray(e.value) ? e.value[0] : e.value;
          setCurrentIndex(index);
        }}
      >
        <Slider.ValueText>
          {currentIndex + 1} / {trajectoryPoints.length} :{" "}
          {trajectoryPoints[currentIndex]?.recordedDateTime.toLocaleString() ??
            "—"}
        </Slider.ValueText>
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumbs />
        </Slider.Control>
      </Slider.Root>
      <HStack>
        <Button onClick={() => setIsPlaying(!isPlaying)} mt={4}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Select.Root
          value={[String(playbackInterval)]}
          onValueChange={(e) => setPlaybackInterval(Number(e.value))}
          width="150px"
          ml={4}
          collection={playbackIntervalMap}
        >
          <Select.HiddenSelect />
          <Select.Label>Playback Interval</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select Interval" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {playbackIntervalMap.items.map((option) => (
                  <Select.Item item={option} key={option.value}>
                    {option.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </HStack>
    </Box>
  );
};
