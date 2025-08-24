/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { Box, Image, Separator, Table, Text } from "@chakra-ui/react";

interface SearchSelectionProps<T> {
  results: T[];
  onSelect: (selectedItem: T) => void;
}

export function SearchSelection<T>({
  results,
  onSelect,
}: SearchSelectionProps<T>) {
  // function handleItemClick(item: T) {
  //   onSelect(item);
  // }
  console.log("results=", results);
  return (
    <div>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <Box marginTop={5}>
          <Separator />
          <Text>Search Results:</Text>
          <Text>Choose what reflects on your form.</Text>
          <Table.Root interactive stickyHeader variant="outline">
            <Table.Header>
              <Table.Row>
                {Object.keys(results[0] ?? {}).map((key) => (
                  <Table.ColumnHeader key={key}>{key}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {results.map((item, index) => (
                <Table.Row
                  key={index}
                  onClick={() => onSelect(item)}
                  cursor="pointer"
                >
                  {Object.keys(item ?? {}).map((key) => (
                    <Table.Cell key={key}>
                      {key === "coverImageUrl" && item[key as keyof T] ? (
                        <Image src={String(item[key as keyof T])} />
                      ) : (
                        String(item[key as keyof T])
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </div>
  );
}
