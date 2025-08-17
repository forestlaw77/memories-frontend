// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { defaultInitialSettings } from "@/contexts/globalSettingsUtils";
import {
  BaseContentMeta,
  BaseDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import {
  Box,
  Card,
  Image as ChakraImage,
  Checkbox,
  HStack,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRef } from "react";
import { AiOutlineEdit } from "react-icons/ai";

export default function ResourceGrid({
  resources,
  resourceType,
  thumbnails,
  selectedIds = [],
  onToggle,
  selectAllToggle,
  geoResourceIds,
  setHoveredId,
}: {
  resources: ResourceMeta<BaseContentMeta, BaseDetailMeta>[];
  resourceType: string;
  thumbnails: { [key: string]: string };
  selectedIds: string[];
  onToggle: (id: string) => void;
  selectAllToggle: () => void;
  geoResourceIds?: string[];
  setHoveredId?: (id: string) => void;
}) {
  console.debug("ResourceGrid");
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const lastHoverId = useRef<string | null>(null);
  const { settings } = useGlobalSettings();

  function onMouseOver(id: string) {
    if (setHoveredId) {
      lastHoverId.current = id;
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => {
        if (lastHoverId.current === id) {
          setHoveredId(id); // 一定時間の継続後に実行
        }
      }, 500);
    }
  }
  function onMouseLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    lastHoverId.current = null;
    if (setHoveredId) {
      setHoveredId(""); // マウスが離れたときに空文字を設定
    }
  }

  // useEffect(() => {
  //   if (!geoResourceIds || geoResourceIds.length === 0) return;
  //   const allIds = resources.map((res) => res.basicMeta.resourceId);

  //   allIds.forEach((id) => {
  //     const el = document.getElementById(`resource-${id}`);
  //     const shouldHighlight = geoResourceIds?.includes(id);
  //     if (el) {
  //       el.classList.toggle("highlighted", shouldHighlight);
  //     }
  //   });
  // }, [geoResourceIds, resources]);

  // if (process.env.NODE_ENV === "development") {
  //   console.log("Rendering: ResourceGrid component");
  // }
  return (
    <Box>
      <HStack>
        Check All:
        <Checkbox.Root
          variant="subtle"
          checked={selectedIds.length === resources.length}
          onChange={() => selectAllToggle()}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </HStack>
      <Stack gap="4" direction="row" wrap="wrap">
        {resources.map((resource) => {
          const resourceId = resource.basicMeta.resourceId;
          const linkHref = `/${resourceType}/${resourceId}`;
          const isHighlighted = geoResourceIds?.includes(resourceId);

          return (
            <Card.Root
              key={resource.basicMeta.resourceId}
              shadow="md"
              borderWidth="1px"
              width="250px"
              borderColor={
                selectedIds.includes(resourceId)
                  ? "blue.500"
                  : isHighlighted
                  ? "teal.500"
                  : "gray.200"
              }
              bgColor={
                selectedIds.includes(resourceId)
                  ? "blue.300"
                  : isHighlighted
                  ? "teal.100"
                  : "gray.100"
              }
              id={`resource-${resourceId}`}
            >
              <HStack justifyContent="space-between" px={2} pt={2}>
                <Checkbox.Root
                  variant="subtle"
                  checked={selectedIds.includes(resourceId)}
                  onChange={() => onToggle(resourceId)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
                <NextLink href={`/${resourceType}/${resourceId}/edit`}>
                  <Icon color="gray.500">
                    <AiOutlineEdit />
                  </Icon>
                </NextLink>
              </HStack>
              <NextLink href={linkHref}>
                <ChakraImage
                  width="250px"
                  height="250px"
                  fit={
                    settings.imageFitMode ?? defaultInitialSettings.imageFitMode
                  }
                  src={thumbnails[resourceId]}
                  alt={resource.detailMeta?.title || `Image of ${resourceId}`}
                  loading="lazy"
                  onMouseOver={() => onMouseOver(resourceId)}
                  onMouseLeave={() => onMouseLeave()}
                />
              </NextLink>
              <Card.Body>
                <Box>
                  <Card.Title fontWeight="bold">
                    <Text lineClamp="1">
                      {resource.detailMeta?.title || ""}
                    </Text>
                  </Card.Title>
                  <Card.Description>
                    <Text as="span" lineClamp="2">
                      {resource.detailMeta?.description || ""}
                    </Text>
                  </Card.Description>
                </Box>
              </Card.Body>
            </Card.Root>
          );
        })}
      </Stack>
    </Box>
  );
}
