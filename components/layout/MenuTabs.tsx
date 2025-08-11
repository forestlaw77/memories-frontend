// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { ColorModeToggle } from "@/components/common/ColorModeToggle";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { useSessionLifecycleManager } from "@/hooks/useSessionLifecycleManager";
import {
  Avatar,
  Button,
  ClientOnly,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Menu,
  Portal,
  Skeleton,
  Tabs,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation"; // usePathname をインポート
import { useState } from "react";
import { FaMusic, FaVideo } from "react-icons/fa";
import { FcHome } from "react-icons/fc";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { GiBookshelf } from "react-icons/gi";
import { IoMdPhotos } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import { PreferencesDrawer } from "../settings/PreferencesDrawer";
import { SessionCountdownBanner } from "./SessionCountdownBanner";

export const resourceMenu = [
  {
    name: "Bookshelf",
    resourceType: "books",
    smallIcon: <GiBookshelf />,
    icon: "/cool bookshelf icon.png",
    color: "#FF6384",
  },
  {
    name: "Document Library",
    resourceType: "documents",
    smallIcon: <IoDocumentTextOutline />,
    icon: "/cool document library.png",
    color: "#36A2EB",
  },
  {
    name: "Photo Gallery",
    resourceType: "images",
    smallIcon: <IoMdPhotos />,
    icon: "/cool photo gallery icon.png",
    color: "#4BC0C0",
  },
  {
    name: "Music Library",
    resourceType: "music",
    smallIcon: <FaMusic />,
    icon: "/music library icon.png",
    color: "#FFCE56",
  },
  {
    name: "Video Library",
    smallIcon: <FaVideo />,
    resourceType: "videos",
    icon: "/video library icon.png",
    color: "#9966FF",
  },
].map((item) => ({ ...item, path: `/${item.resourceType}` }));

const MenuTabs = () => {
  const { data: session } = useSession();
  const pathname = usePathname(); // 現在のパスを取得
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const { settings } = useGlobalSettings();
  const {
    showWarning,
    remainingMinutes,
    extendSession,
    logout,
    dismissWarning,
  } = useSessionLifecycleManager({
    logoutAfterMinutes: settings.logoutAfterMinutes,
    warningBeforeMinutes: settings.warningBeforeMinutes,
  });
  const handleMenuSelect = (details: { value: string | number }) => {
    if (details.value === "preferences") {
      setIsPreferencesOpen(!isPreferencesOpen);
    }
    if (details.value === "logout") {
      logout();
    }
  };
  const showLabel = useBreakpointValue({ base: false, md: true });

  const getActiveTabValue = () => {
    if (pathname === "/") {
      return "Home";
    }

    const matchedMenu = resourceMenu.find((menu) =>
      pathname.startsWith(menu.path)
    );
    if (matchedMenu) {
      return matchedMenu.resourceType;
    }
    // どのタブにも一致しない場合のフォールバック
    return undefined; // 何もアクティブにしない
  };

  console.log("remainingMinutes:", remainingMinutes);

  return (
    <Flex
      as="header"
      px={4}
      py={2}
      align="center"
      justify="space-between"
      borderColor="gray.200"
    >
      <Dialog.Root open={showWarning} onOpenChange={dismissWarning}>
        <Dialog.Trigger />
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />
            <Dialog.Header>
              <Dialog.Title>Session extension</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {remainingMinutes !== null && (
                <SessionCountdownBanner minutes={remainingMinutes} />
              )}
              Your session is about to end. Would you like to extend it?
            </Dialog.Body>
            <Dialog.Footer>
              <Button colorPalette="red" variant="outline" onClick={logout}>
                Logout
              </Button>
              <Button variant="outline" onClick={extendSession}>
                Extend
              </Button>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <PreferencesDrawer
        isOpen={isPreferencesOpen}
        onOpenChange={() => setIsPreferencesOpen(false)}
      />
      <HStack>
        {/* value プロパティで現在のパスと同期させる */}
        <Tabs.Root value={getActiveTabValue()} variant="outline">
          <Tabs.List>
            <Tabs.Trigger value="Home" asChild>
              <NextLink href="/">
                <FcHome />
              </NextLink>
            </Tabs.Trigger>

            {resourceMenu.map((menu) => (
              <Tabs.Trigger
                key={menu.resourceType}
                value={menu.resourceType}
                asChild
              >
                <NextLink href={menu.path}>
                  {menu.smallIcon}
                  {showLabel && menu.name}
                </NextLink>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </HStack>

      <HStack>
        <ClientOnly fallback={<Skeleton w="6" h="6" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>

        {session?.user && (
          <Menu.Root onSelect={handleMenuSelect}>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <Avatar.Root shape="full" size="xs" variant="subtle">
                  <Avatar.Image
                    src={session.user.image || "/defaultAvatar.png"}
                  />
                </Avatar.Root>
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="preferences">
                    <FiSettings /> Preferences
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item value="logout">
                    <FiLogOut /> Logout
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        )}
      </HStack>
    </Flex>
  );
};

export default MenuTabs;
