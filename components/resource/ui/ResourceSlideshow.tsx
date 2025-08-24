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

import ThumbnailLoader from "@/components/resource/ThumbnailLoader";
import TrajectorySlide from "@/components/trajectory/TrajectorySlide";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "@/types/client/client_model";
//import NextImage from "next/image";
import { Box } from "@chakra-ui/react";
import NextLink from "next/link";
import { useEffect } from "react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/bundle";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper/types";

interface ResourceSlideshowProps {
  resources: ResourceMeta<BaseContentMeta, BaseDetailMeta>[];
  resourceType: RESOURCE_TYPE;
  thumbnails: { [key: string]: string };
  currentId?: string;
  onSelect?: (id: string) => void;
  swiperRef?: React.MutableRefObject<SwiperType | undefined>;
  autoplay?: boolean;
}

export default function ResourceSlideshow({
  resources,
  resourceType,
  thumbnails,
  currentId,
  onSelect,
  swiperRef,
  autoplay = false,
}: ResourceSlideshowProps) {
  //const { settings } = useGlobalSettings();

  useEffect(() => {
    if (!swiperRef?.current || !currentId) return;
    const index = resources.findIndex(
      (r) => r.basicMeta.resourceId === currentId
    );
    if (index !== -1) {
      swiperRef.current.slideToLoop(index);
    }
  }, [currentId, resources, swiperRef]);

  return (
    <Swiper
      effect={"fade"}
      grabCursor={true}
      spaceBetween={1}
      slidesPerView={5}
      navigation={true}
      loop={true} // 無限ループ
      autoplay={autoplay ? { delay: 2000, disableOnInteraction: false } : false} // 2秒ごとにスライド
      modules={[Autoplay, EffectFade, Navigation]} // Autoplay モジュールを追加
      onSwiper={(swiper) => {
        if (swiperRef) swiperRef.current = swiper;
      }}
      onSlideChange={(swiper) => {
        const resource = resources[swiper.realIndex];
        if (onSelect && resource) {
          onSelect(resource.basicMeta.resourceId);
        }
        if (!resource) {
          console.error(`swiper resouce undefined. index=${swiper.realIndex}`);
        }
      }}
    >
      {resources.map((resource) => {
        const isActive = resource.basicMeta.resourceId === currentId;
        return (
          <SwiperSlide key={resource.basicMeta.resourceId}>
            <Box
              border={isActive ? "2px solid #3182ce" : "none"}
              borderRadius="md"
              overflow="hidden"
            >
              <ThumbnailLoader
                resourceType={resourceType}
                resourceId={resource.basicMeta.resourceId}
              />
              <NextLink
                href={`/${resourceType}/${resource.basicMeta.resourceId}`}
              >
                {/* <ChakraImage
                  src={
                    thumbnails[resource.basicMeta.resourceId] ||
                    "/default-cover-image.png"
                  }
                  alt={resource.detailMeta?.title || "Unknown"}
                  width={250}
                  height={250}
                  fit={settings.imageFitMode || "cover"}
                /> */}
                <TrajectorySlide resourceId={resource.basicMeta.resourceId} />
              </NextLink>
            </Box>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
