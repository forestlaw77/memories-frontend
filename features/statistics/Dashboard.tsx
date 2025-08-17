/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { resourceMenu } from "@/components/layout/MenuTabs";
import { useFetcherParams } from "@/contexts/FetcherParamsContext";
import ResourcePieChart from "@/features/statistics/ResourcePieChart";
import { ResourceFetcherError } from "@/libs/api/resource_fetcher";
import { fetchResourcesSummary } from "@/libs/api/resources";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import {
  Box,
  Text as ChakraText,
  Heading,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { useQueries } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

type ResourceSummary = {
  resourceCount: number;
  contentCount: number;
};

const resourceCountByType: Record<RESOURCE_TYPE, number> = Object.fromEntries(
  Object.values(RESOURCE_TYPE).map((type) => [type, 0])
) as Record<RESOURCE_TYPE, number>;
const contentCountByType: Record<RESOURCE_TYPE, number> = Object.fromEntries(
  Object.values(RESOURCE_TYPE).map((type) => [type, 0])
) as Record<RESOURCE_TYPE, number>;

export function Dashboard() {
  const { authToken } = useFetcherParams();

  const resourceTypes = Object.values(RESOURCE_TYPE);
  const queries = useQueries({
    queries: resourceTypes.map((type) => ({
      queryKey: ["summay", type],
      enabled: !!authToken,
      queryFn: async () => {
        try {
          return await fetchResourcesSummary(type, authToken as string);
        } catch (err: any) {
          if (err instanceof ResourceFetcherError) {
            const status = (err.originalError as { status?: number })?.status;
            if (status === 401) {
              signOut();
            }
          }
          console.error(
            `Error fetching a summary of resourcess of type ${type}:`,
            err
          );
          throw err;
        }
      },
      staleTime: 1000 * 60 * 10, // 10 min
    })),
  });
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errorMessages = queries
    .map((query) => query.error?.message)
    .filter(Boolean);

  let resourceCount = 0;
  resourceTypes.forEach((type, index) => {
    const data = queries[index].data as ResourceSummary | undefined;
    resourceCountByType[type] = data?.resourceCount ?? 0;
    resourceCount += resourceCountByType[type];
    contentCountByType[type] = data?.contentCount ?? 0;
  });

  // リソースタイプごとの色をマッピング
  const colorMap = Object.fromEntries(
    resourceMenu.map(({ resourceType, color }) => [resourceType, color])
  );

  if (isError) {
    return (
      <Box p={6}>
        <Heading size="md">Error Loading Resources</Heading>
        {errorMessages.length > 0 ? (
          errorMessages.map((msg, idx) => (
            <ChakraText color="red.500" key={idx}>
              {msg}
            </ChakraText>
          ))
        ) : (
          <ChakraText color="red.500">
            An unknown error occurred while fetching resources.
          </ChakraText>
        )}
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <>
      {/* リソースの割合をグラフで表示 */}
      <Box mt={6} p={4} bg="gray.100" borderRadius="md" mb={6}>
        <Heading size="md">Resource overview</Heading>
        <ChakraText>Total number of resources: {resourceCount}</ChakraText>
        {/* <ChakraText>Total number of contents: {contentCount}</ChakraText> */}
        <HStack>
          <ResourcePieChart
            data={resourceCountByType}
            title="Resource percentage"
            colors={colorMap}
          />
          <ResourcePieChart
            data={contentCountByType}
            title="Content percentage"
            colors={colorMap}
          />
        </HStack>
      </Box>
    </>
  );
}
