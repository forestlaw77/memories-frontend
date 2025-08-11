// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import DynamicBreadcrumb from "@/components/common/DynamicBreadcrumb";
import { Dashboard } from "@/features/statistics/Dashboard";
import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";
import NextLink from "next/link";

// リソースメニューの定義（resourceType 追加、path を動的設定）
const resourceMenu = [
  {
    name: "Bookshelf",
    resourceType: "books",
    icon: "/cool bookshelf icon.png",
    color: "#FF6384",
  },
  {
    name: "Document Library",
    resourceType: "documents",
    icon: "/cool document library.png",
    color: "#36A2EB",
  },
  {
    name: "Photo Gallery",
    resourceType: "images",
    icon: "/cool photo gallery icon.png",
    color: "#4BC0C0",
  },
  {
    name: "Music Library",
    resourceType: "music",
    icon: "/music library icon.png",
    color: "#FFCE56",
  },
  {
    name: "Video Library",
    resourceType: "videos",
    icon: "/video library icon.png",
    color: "#9966FF",
  },
].map((item) => ({ ...item, path: `/${item.resourceType}` }));

export default function Home() {
  return (
    <div>
      <DynamicBreadcrumb />
      {/* ヘッダー部分 */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">
          Welcome Memories
        </Heading>
      </Flex>

      {/* リソース一覧のリンク */}
      <Flex mt={6} wrap="wrap" gap={4}>
        {resourceMenu.map((resource) => (
          <NextLink href={resource.path} key={resource.resourceType}>
            <Box
              p={4}
              bg="blue.100"
              borderRadius="md"
              _hover={{ bg: "blue.200", transform: "scale(1.05)" }}
              transition="0.2s"
            >
              <Image
                src={resource.icon}
                width="200px"
                height="200px"
                alt={resource.name}
              />
              <Text
                fontWeight="medium"
                fontSize="medium"
                color={resource.color}
                bg="white"
                textAlign="center"
                //textShadow="2px 2px 4px rgba(0, 0, 0, 0.3)"
              >
                {resource.name}
              </Text>
            </Box>
          </NextLink>
        ))}
      </Flex>
      <Dashboard />
    </div>
  );
}
