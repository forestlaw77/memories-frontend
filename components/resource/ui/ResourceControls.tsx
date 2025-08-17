/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";
import { BiSortAlt2, MdDelete, SiGithubactions } from "@/assets/icons";
import ActiveFilterTags from "@/components/settings/ActiveFilterTags";
import FilterAccordionSection from "@/components/settings/FilterAccordionSection";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
import {
  ImageFitMode,
  SortStrategy,
  ViewMode,
} from "@/types/client/view_preferences";
import { Box, Button, HStack, Icon, Menu, Portal } from "@chakra-ui/react";
import {
  actionLabelMapsByResourceType,
  getMenuMeta,
  imageFitModeLabelMapsByResourceType,
  sortLabelMapsByResourceType,
  viewModeLabelMapsByResourceType,
} from "./menuDefinitions";

export default function ResourceControls({
  resourceType,
  allResources,
  setPage,
  count,
  onAction,
}: {
  resourceType: RESOURCE_TYPE;
  allResources: ResourceMeta<BaseContentMeta, BaseDetailMeta>[] | undefined;
  setPage: (page: number) => void;
  count: number;
  onAction: (action: string) => void;
}) {
  const { settings, dispatch } = useGlobalSettings();

  const currentViewModeMenuMeta = getMenuMeta(
    viewModeLabelMapsByResourceType,
    resourceType,
    settings.viewMode as ViewMode
  );
  const currentViewLabel = currentViewModeMenuMeta.label;
  const currentViewIcon = currentViewModeMenuMeta.icon;

  const currentImageFitModeMenuMeta = getMenuMeta(
    imageFitModeLabelMapsByResourceType,
    resourceType,
    settings.imageFitMode as ImageFitMode
  );
  const currentImageFitModeLabel = currentImageFitModeMenuMeta.label;
  const currentImageFitModeIcon = currentImageFitModeMenuMeta.icon;

  const currentSortMenuMeta = getMenuMeta(
    sortLabelMapsByResourceType,
    resourceType,
    settings.sortStrategy as SortStrategy
  );
  const currentSortLabel = currentSortMenuMeta.label;
  const currentSortIcon = currentSortMenuMeta.icon;

  return (
    <div>
      <HStack gap={4} mt={2} wrap="wrap">
        {/* Action Menu */}
        <Menu.Root onSelect={(details) => onAction(details.value)}>
          <Menu.Trigger asChild>
            <Button
              variant="surface"
              colorPalette="blue"
              minW={{ base: "100px", md: "140px" }}
              maxW={{ base: "100px", md: "140px" }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              <SiGithubactions />
              <Box as="span" ml={2}>
                {count > 0 ? `Action (${count})` : "Action"}
              </Box>
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {Object.entries(
                  actionLabelMapsByResourceType[resourceType]
                ).map(([key, { icon, label }]) => (
                  <Menu.Item
                    key={key}
                    value={key}
                    disabled={
                      (key === "bulkEdit" && count === 0) ||
                      (key === "bulkAdd" && allResources?.length === 0)
                    }
                  >
                    {icon}
                    <Box flex="1">
                      {label} {resourceType}
                    </Box>
                  </Menu.Item>
                ))}
                <Menu.Separator />
                <Menu.Item
                  disabled={count === 0}
                  value="delete"
                  color="fg.error"
                  _hover={{ bg: "bg.error", color: "fg.error" }}
                >
                  <MdDelete />
                  Delete {resourceType}s...
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        {/* View Menu */}
        <Menu.Root
          onSelect={(details) =>
            dispatch({ type: "viewMode", value: details.value as ViewMode })
          }
        >
          <Menu.Trigger asChild>
            <Button
              variant="surface"
              colorPalette="blue"
              minW={{ base: "100px", md: "140px" }}
              maxW={{ base: "100px", md: "140px" }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {currentViewIcon}
              <Box as="span" ml={2}>
                {currentViewLabel}
              </Box>
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {Object.entries(
                  viewModeLabelMapsByResourceType[resourceType]
                ).map(([key, { icon, label }]) => {
                  if (label === null || label === undefined) {
                    // Skip items with no label (e.g., Trajectory view)
                    return null;
                  }
                  return (
                    <Menu.Item
                      key={key}
                      value={key}
                      disabled={settings.viewMode === key}
                    >
                      {icon}
                      <Box flex="1">{label}</Box>
                    </Menu.Item>
                  );
                })}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        {/* Image Fit Mode Menu */}
        <Menu.Root
          onSelect={(details) =>
            dispatch({
              type: "imageFitMode",
              value: details.value as ImageFitMode,
            })
          }
        >
          <Menu.Trigger asChild>
            <Button
              variant="surface"
              colorPalette="blue"
              minW={{ base: "100px", md: "140px" }}
              maxW={{ base: "100px", md: "140px" }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {currentImageFitModeIcon}
              <Box as="span" ml={2}>
                Fit {currentImageFitModeLabel}
              </Box>
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {Object.entries(
                  imageFitModeLabelMapsByResourceType[resourceType]
                ).map(([key, { icon, label }]) => (
                  <Menu.Item
                    key={key}
                    value={key}
                    disabled={settings.imageFitMode === key}
                  >
                    {icon}
                    <Box flex="1">{label}</Box>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        {/* Sort Menu */}
        <Menu.Root
          onSelect={(details) => {
            dispatch({
              type: "sortStrategy",
              value: details.value as SortStrategy,
            });
            setPage(1); // Reset to page 1 on sort change
          }}
        >
          <Menu.Trigger asChild>
            <Button
              variant="surface"
              colorPalette="blue"
              minW={{ base: "100px", md: "140px" }}
              maxW={{ base: "100px", md: "140px" }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              <Icon size="xs">
                <BiSortAlt2 />
              </Icon>
              <Icon size="xs">{currentSortIcon}</Icon>

              <Box flex="1">{currentSortLabel}</Box>
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {Object.entries(sortLabelMapsByResourceType[resourceType]).map(
                  ([key, { icon, label }]) => (
                    <Menu.Item
                      key={key}
                      value={key}
                      disabled={settings.sortStrategy === key}
                    >
                      {icon}
                      <Box flex="1">{label}</Box>
                    </Menu.Item>
                  )
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        <Box flex="1">
          <ActiveFilterTags setPage={setPage} />
        </Box>
        <Box flex="1" minW="260px">
          <FilterAccordionSection setPage={setPage} />
        </Box>
      </HStack>
    </div>
  );
}
