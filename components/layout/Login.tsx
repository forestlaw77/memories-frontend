/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */

import { clientEnv } from "@/libs/config/env.client";
import {
  Alert,
  Button,
  Text as ChakraText,
  Flex,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const router = useRouter();
  const isSkipAuth = clientEnv.NEXT_PUBLIC_SKIP_AUTH === "true";
  return (
    <Flex height="100vh" justify="center" align="center">
      <VStack
        maxWidth={["90%", "640px"]}
        gap={6}
        p={8}
        bg="blue.50"
        color="gray.800"
        borderRadius="lg"
        boxShadow="lg"
        textAlign="center"
      >
        <Heading size="2xl" color="blue.600">
          Memories
        </Heading>

        <Alert.Root status="info" borderRadius="md" py={4} px={6} bg="blue.100">
          <Alert.Indicator />
          <ChakraText fontSize="lg">
            Your session has ended. Please log in again to continue.
          </ChakraText>
        </Alert.Root>
        {isSkipAuth ? (
          <Button onClick={() => router.push("/")}>
            仮ユーザーとして再開する
          </Button>
        ) : (
          <Button
            onClick={() => signIn("google")}
            colorScheme="blue"
            size="lg"
            _hover={{
              bg: "blue.500",
              transform: "scale(1.02)",
              boxShadow: "md",
            }}
            transition="all 0.3s"
          >
            <FcGoogle /> Login with Google
          </Button>
        )}
      </VStack>
    </Flex>
  );
}
