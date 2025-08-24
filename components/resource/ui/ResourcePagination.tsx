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

import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export default function ResourcePagination({
  totalCount,
  pageSize,
  setPage,
}: {
  totalCount: number;
  pageSize: number;
  setPage: (page: number) => void;
}) {
  const { settings, dispatch } = useGlobalSettings();

  function onPageChange(page: number) {
    dispatch({
      type: "currentPage",
      value: page,
    });
    setPage(page);
  }

  return (
    <Pagination.Root
      count={totalCount}
      pageSize={pageSize}
      page={settings.currentPage}
      onPageChange={(e) => onPageChange(Number(e.page))}
    >
      <ButtonGroup variant="ghost" size="sm">
        <Pagination.PrevTrigger asChild>
          <IconButton>
            <HiChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>
        <Pagination.Items
          render={(page: { value: number }) => (
            <IconButton variant={{ base: "ghost", _selected: "outline" }}>
              {page.value}
            </IconButton>
          )}
        />
        <Pagination.NextTrigger asChild>
          <IconButton>
            <HiChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  );
}
