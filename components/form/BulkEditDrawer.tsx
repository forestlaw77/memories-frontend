// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import useEditHandleSubmit from "@/hooks/useEditHandleSubmit";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import {
  Box,
  Text as ChakraText,
  CloseButton,
  Drawer,
  Portal,
} from "@chakra-ui/react";
import { ResourceEditPanel } from "./ResourceEditPanel";

interface BulkEditDrawerProps {
  isOpen: boolean;
  onOpenChange: () => void;
  resourceType: RESOURCE_TYPE;
  selectedIds: string[];
  // setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  // defaultValues?: { [key: string]: string };
  // onSubmit: (formData: { [key: string]: string }) => void;
  // isSubmitting?: boolean;
}

export default function BulkEditDrawer({
  isOpen,
  onOpenChange,
  resourceType,
  selectedIds,
}: // setSelectedIds,
// defaultValues,
// onSubmit,
// isSubmitting,
BulkEditDrawerProps) {
  const handleSubmit = useEditHandleSubmit(resourceType, {
    mode: "bulk",
    selectedIds,
    onBulkSuccess: () => {
      onOpenChange();
    },
  });

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      placement="end"
      size="xl"
    >
      <Portal>
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              Bulk Edit ({selectedIds.length} items)
            </Drawer.Header>
            <Drawer.Body>
              <Box px={2}>
                <ResourceEditPanel
                  mode="bulk"
                  resourceType={resourceType}
                  selectedIds={selectedIds}
                  defaultValues={{}}
                  handleSubmit={handleSubmit}
                />
              </Box>
            </Drawer.Body>
            <Drawer.Footer>
              <ChakraText fontSize="xs" color="gray.500">
                Only fields with values will be applied to all selected items.
              </ChakraText>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
