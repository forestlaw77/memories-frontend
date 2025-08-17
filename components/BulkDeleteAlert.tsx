/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import { useBulkDeleteMutation } from "@/hooks/useDeleteMutation";
import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import {
  Alert,
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { MdDelete } from "react-icons/md";

interface BulkDeleteAlertProps {
  isOpen: boolean;
  onOpenChange: () => void;
  resourceType: RESOURCE_TYPE;
  selectedIds: string[];
}

export default function BulkDeleteAlert({
  isOpen,
  onOpenChange,
  resourceType,
  selectedIds,
}: BulkDeleteAlertProps) {
  const { authToken } = useFetcherParams();
  const fetcher = useMemo(
    () => createFetcher(resourceType, false, authToken),
    [resourceType, authToken]
  );

  const deleteMutation = useBulkDeleteMutation({
    resourceType,
    fetcher,
    selectedIds,
  });
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      placement="top"
      size="xl"
    >
      <Portal>
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Alert.Root status="warning">
                <Alert.Indicator>
                  <MdDelete />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>Confirm Deletion</Alert.Title>
                  <Alert.Description>
                    Are you sure you want to delete {selectedIds.length} items?
                  </Alert.Description>
                </Alert.Content>
                <CloseButton pos="relative" top="-2" insetEnd="-2" />
              </Alert.Root>
            </Dialog.Header>
            <Dialog.Body>
              <Box px={2}></Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="red"
                onClick={() => {
                  deleteMutation.mutate();
                  onOpenChange();
                }}
              >
                Delete
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
