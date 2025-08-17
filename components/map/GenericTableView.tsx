/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { Table, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface GenericTableViewProps {
  groupedData: { [key: string]: any[] };
  hoveredId?: string;
  detailPath: (
    country: string | undefined,
    state: string | undefined,
    city: string | undefined
  ) => string;
  resolveKeyToParams: (key: string) => {
    country: string | undefined;
    state: string | undefined;
    city: string | undefined;
  };
}

export default function GenericTableView({
  groupedData,
  hoveredId,
  detailPath,
  resolveKeyToParams,
}: GenericTableViewProps) {
  const router = useRouter();

  return (
    <VStack
      maxW="512px"
      height="288px"
      align="start"
      p={4}
      bg="gray.100"
      overflowY="scroll"
    >
      <Table.Root>
        <Table.Body>
          {Object.entries(groupedData)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([key, items]) => {
              if (typeof resolveKeyToParams !== "function") {
                console.error("resolveKeyToParams is not a function");
                return null;
              }
              const { country, state, city } = resolveKeyToParams(key);
              return (
                <Table.Row
                  key={key}
                  className={
                    items.some((res) => res.basicMeta.resourceId === hoveredId)
                      ? "highlighted"
                      : ""
                  }
                >
                  <Table.Cell
                    minWidth="50px"
                    textAlign="left"
                    fontSize={items.length > 50 ? "lg" : "md"}
                    _hover={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() =>
                      router.push(detailPath(country, state, city))
                    }
                  >
                    {key}
                  </Table.Cell>
                  <Table.Cell minWidth="50px" textAlign="right">
                    {items.length}
                  </Table.Cell>
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table.Root>
    </VStack>
  );
}
