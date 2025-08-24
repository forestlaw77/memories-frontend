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

import { Box, Button, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

export function BookSelection({
  books,
  onSelect,
}: {
  books: Record<string, any>[];
  onSelect: (book: Record<string, any>) => void;
}) {
  const [selectedBook, setSelectedBook] = useState<Record<string, any> | null>(
    null
  );

  return (
    <div>
      <h2>検索結果から選択</h2>
      <Stack>
        {books.map((book) => (
          <Box
            key={book.isbn}
            p={4}
            borderWidth={selectedBook?.isbn === book.isbn ? "2px" : "1px"}
            borderColor={
              selectedBook?.isbn === book.isbn ? "blue.500" : "gray.300"
            }
            borderRadius="md"
          >
            <Flex align="center" gap={4}>
              {book.imageUrl && (
                <Image src={book.imageUrl} alt={book.title} boxSize="80px" />
              )}
              <Stack>
                <Text fontWeight="bold">{book.title}</Text>
                <Text color="gray.600">{book.author}</Text>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    setSelectedBook(book);
                    onSelect(book);
                  }}
                >
                  選択
                </Button>
              </Stack>
            </Flex>
          </Box>
        ))}
      </Stack>
    </div>
  );
}
