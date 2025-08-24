/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { Box, Button, Menu, Portal } from "@chakra-ui/react";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

export default function BulkActionBar({
  count,
  onAction,
}: {
  count: number;
  onAction: (action: string) => void;
}) {
  return (
    <Box>
      <Menu.Root onSelect={(details) => onAction(details.value)}>
        <Menu.Trigger asChild>
          <Button variant="outline" disabled={count === 0}>
            Action {count}
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="edit">
                <AiOutlineEdit />
                <Box flex="1">Edit</Box>
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item
                value="delete"
                color="fg.error"
                _hover={{ bg: "bg.error", color: "fg.error" }}
              >
                <MdDelete />
                Delete...
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  );
}
