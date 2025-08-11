// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.
import { toaster } from "@/components/common/toaster";
import {
  BaseContentMeta,
  BaseDetailMeta,
  BasicMeta,
  BookDetailMeta,
  DocumentDetailMeta,
  ImageContentMeta,
  ImageDetailMeta,
  MusicContentMeta,
  MusicDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
  VideoDetailMeta,
} from "@/types/client/client_model";
import {
  ServerBasicMeta,
  ServerResourceMeta,
} from "@/types/server/server_model";
import { getCountryCenter } from "../maps/country_center_map";
import { resolveCountryCode } from "../maps/country_name_to_iso";

export class ResourceAdapter {
  static fromServerResource<
    TContentMeta extends BaseContentMeta,
    TDetailMeta extends BaseDetailMeta
  >(
    resourceType: RESOURCE_TYPE,
    serverResource: ServerResourceMeta
  ): ResourceMeta<TContentMeta, TDetailMeta> | null {
    // クライアント BasicMeta への適合
    if (!serverResource) {
      toaster.create({
        description: `The resource could not be obtained.`,
        type: "error",
      });
      return null;
    }
    if (!serverResource.id) {
      toaster.create({
        description: `The resource ID could not be obtained.`,
        type: "error",
      });
      return null;
    }
    if (!serverResource.basic_meta) {
      toaster.create({
        description: `Basic metadata could not be retrieved.`,
        type: "error",
      });
      return null;
    }
    const basicMeta = {
      resourceId: serverResource.id,
      resourceType: resourceType,
      createdAt: serverResource.basic_meta.created_at
        ? new Date(serverResource.basic_meta.created_at)
        : null,
      updatedAt: serverResource.basic_meta.updated_at
        ? new Date(serverResource.basic_meta.updated_at)
        : null,
      contents:
        serverResource.basic_meta.contents?.map(
          (content) =>
            ({
              contentId: content.id,
              filename: content.filename,
              mimetype: content.mimetype,
              hash: content.hash,
              size: content.size ? Number(content.size) : undefined,
              createdAt: content.created_at
                ? new Date(content.created_at)
                : undefined,
              updatedAt: content.updated_at
                ? new Date(content.updated_at)
                : undefined,
            } as TContentMeta)
        ) || [],
      childResourceIds: serverResource.basic_meta?.child_resource_ids || [],
      parentResourceIds: serverResource.basic_meta?.parent_resource_ids || [],
    };

    // クライアント DetailMeta への適合
    const serverDetailMeta = serverResource.detail_meta as TDetailMeta;
    const detailMeta = serverDetailMeta
      ? ({
          // RESOURCE_TYPE 個別のもの含めて、一旦文字列で取得し、必要に応じて型変換して上書きする
          ...serverDetailMeta,
          resourceId: serverResource.id, // null チェック済
          title: serverDetailMeta.title ?? null,
          description: serverDetailMeta.description ?? null,
          country: (serverDetailMeta.country = serverDetailMeta.country
            ? resolveCountryCode(serverDetailMeta.country)
            : null),
          state: serverDetailMeta.state ?? null,
          city: serverDetailMeta.city ?? null,
          latitude: isNaN(Number(serverDetailMeta.latitude))
            ? null
            : Number(serverDetailMeta.latitude),
          longitude: isNaN(Number(serverDetailMeta.longitude))
            ? null
            : Number(serverDetailMeta.longitude),
          storageLocation: serverDetailMeta.storageLocation ?? null,
          recordedDateTime: serverDetailMeta.recordedDateTime
            ? new Date(serverDetailMeta.recordedDateTime)
            : null,
        } as TDetailMeta)
      : undefined;

    // RESOURCE_TYPE 固有の適合
    if (detailMeta) {
      applyDetailMetaEnhancement<TContentMeta, TDetailMeta>(
        resourceType,
        serverResource.basic_meta,
        basicMeta,
        detailMeta
      );
    }

    return {
      basicMeta,
      detailMeta,
    };
  }
}

function applyDetailMetaEnhancement<
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
>(
  resourceType: RESOURCE_TYPE,
  serverBasicMeta: ServerBasicMeta,
  basicMeta: BasicMeta<TContentMeta>,
  detailMeta: TDetailMeta
) {
  switch (resourceType) {
    case RESOURCE_TYPE.BOOKS:
      enhanceBookMeta(basicMeta, detailMeta as BookDetailMeta, serverBasicMeta);
      break;
    case RESOURCE_TYPE.DOCUMENTS:
      enhanceDocumentMeta(
        basicMeta,
        detailMeta as DocumentDetailMeta,
        serverBasicMeta
      );
      break;
    case RESOURCE_TYPE.IMAGES:
      enhanceImageMeta(
        basicMeta,
        detailMeta as ImageDetailMeta,
        serverBasicMeta
      );
      break;
    case RESOURCE_TYPE.MUSIC:
      enhanceMusicMeta(
        basicMeta,
        detailMeta as MusicDetailMeta,
        serverBasicMeta
      );
      break;
    case RESOURCE_TYPE.VIDEOS:
      enhanceVideoMeta(
        basicMeta,
        detailMeta as VideoDetailMeta,
        serverBasicMeta
      );
      break;
    default:
      console.warn(
        `No enhancement function for resource type: ${resourceType}`
      );
      break;
  }
}

function enhanceBookMeta(
  basicMeta: BasicMeta<BaseContentMeta>,
  detailMeta: BookDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const countryCenter = getCountryCenter(detailMeta.country);
  if (
    (detailMeta.latitude === null || detailMeta.longitude === null) &&
    countryCenter
  ) {
    [detailMeta.latitude, detailMeta.longitude] = countryCenter;
  }

  const content = serverBasicMeta.contents[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  detailMeta.title = detailMeta.title || exif.Title;
  detailMeta.author = detailMeta.author || exif.Creator;
  detailMeta.publisher = detailMeta.publisher || exif.Publisher;
  detailMeta.publishedAt =
    detailMeta.publishedAt || exif.Date || exif.MetadataDate;
  detailMeta.publishedAt = detailMeta.publishedAt
    ? new Date(detailMeta.publishedAt)
    : undefined;
  detailMeta.recordedDateTime =
    detailMeta.recordedDateTime || (detailMeta.publishedAt ?? null);
}

function enhanceDocumentMeta(
  basicMeta: BasicMeta<BaseContentMeta>,
  detailMeta: DocumentDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const countryCenter = getCountryCenter(detailMeta.country);
  if (
    (detailMeta.latitude === null || detailMeta.longitude === null) &&
    countryCenter
  ) {
    [detailMeta.latitude, detailMeta.longitude] = countryCenter;
  }

  const content = serverBasicMeta.contents?.[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  detailMeta.title = detailMeta.title || exif.Title;
  detailMeta.creator = detailMeta.creator || exif.Creator;
  detailMeta.recordedDateTime =
    detailMeta.recordedDateTime ||
    (basicMeta.createdAt ? new Date(basicMeta.createdAt) : null);
}

function enhanceImageMeta(
  basicMeta: BasicMeta<ImageContentMeta>,
  detailMeta: ImageDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const content = serverBasicMeta.contents?.[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  const location = content.extra_info?.location;

  detailMeta.latitude =
    detailMeta.latitude === null && !isNaN(Number(exif.GPSLatitude))
      ? Number(exif.GPSLatitude)
      : detailMeta.latitude;
  detailMeta.longitude =
    detailMeta.longitude === null && !isNaN(Number(exif.GPSLongitude))
      ? Number(exif.GPSLongitude)
      : detailMeta.longitude;

  detailMeta.address = detailMeta.address || location?.address_string;
  detailMeta.orientation = getOrientationValue(exif?.Orientation);
  detailMeta.shootingDateTime = detailMeta.shootingDateTime
    ? new Date(detailMeta.shootingDateTime)
    : exif.DateTimeOriginal
    ? new Date(exif.DateTimeOriginal)
    : undefined;

  detailMeta.shootingOffsetTime = exif.OffsetTime ? exif.OffsetTime : undefined;
  detailMeta.recordedDateTime = detailMeta.shootingDateTime ?? null;
  applyAddressFields(detailMeta, location);

  serverBasicMeta.contents.forEach((c, i) => {
    const exif = c.extra_info?.exif || {};
    const contentMeta = basicMeta.contents[i];
    contentMeta.address = contentMeta.address || location?.address_string;
    console.log("address:", exif);
    contentMeta.latitude =
      contentMeta.latitude ?? exif.GPSLatitude
        ? Number(exif.GPSLatitude)
        : undefined;
    console.log("contentMeta.latitude", contentMeta.latitude);
    contentMeta.longitude =
      contentMeta.longitude ?? exif.GPSLongitude
        ? Number(exif.GPSLongitude)
        : undefined;
    contentMeta.shootingDateTime = exif.DateTimeOriginal
      ? new Date(exif.DateTimeOriginal)
      : undefined;
    contentMeta.shootingOffsetTime = exif.OffsetTime
      ? exif.OffsetTime
      : undefined;
  });
}

function enhanceMusicMeta(
  basicMeta: BasicMeta<MusicContentMeta>,
  detailMeta: MusicDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const countryCenter = getCountryCenter(detailMeta.country);
  if (
    (detailMeta.latitude === null || detailMeta.longitude === null) &&
    countryCenter !== undefined
  ) {
    [detailMeta.latitude, detailMeta.longitude] = countryCenter;
  }

  const content = serverBasicMeta.contents?.[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};

  detailMeta.title = detailMeta.title || exif.Album || exif.Title;
  detailMeta.artist = detailMeta.artist || exif.Artist;
  detailMeta.album = detailMeta.album || exif.Album;
  detailMeta.genre = detailMeta.genre || exif.Genre;
  detailMeta.releaseDate = detailMeta.releaseDate
    ? new Date(detailMeta.releaseDate)
    : exif["Content Create Date"]
    ? new Date(exif["Content Create Date"])
    : undefined;
  detailMeta.fileType = exif.FileType;
  detailMeta.recordedDateTime =
    detailMeta.recordedDateTime ??
    (detailMeta.releaseDate ? detailMeta.releaseDate : null);

  serverBasicMeta.contents.forEach((c, i) => {
    const exif = c.extra_info?.exif || {};
    const contentMeta = basicMeta.contents[i];
    contentMeta.title = exif.Title;
    contentMeta.artist = exif.Artist;
    contentMeta.album = exif.Album;
    contentMeta.genre = exif.Genre;
    contentMeta.releaseDate = exif["Content Create Date"];
    contentMeta.duration = exif.Duration;
    contentMeta.trackNumber = exif.TrackNumber;
    contentMeta.diskNumber = exif.DiskNumber;
    contentMeta.fileType = exif.FileType;
  });
}

function enhanceVideoMeta(
  basicMeta: BasicMeta<BaseContentMeta>,
  detailMeta: VideoDetailMeta,
  serverBasicMeta: ServerBasicMeta
) {
  const content = serverBasicMeta.contents?.[0];
  if (!content) return;
  const exif = content.extra_info?.exif || {};
  const location = content.extra_info?.location;

  detailMeta.latitude =
    Number.isNaN(detailMeta.latitude) && exif.GPSLatitude
      ? Number(exif.GPSLatitude)
      : detailMeta.latitude;
  detailMeta.longitude =
    Number.isNaN(detailMeta.longitude) && exif.GPSLongitude
      ? Number(exif.GPSLongitude)
      : detailMeta.longitude;

  detailMeta.address = location?.address_string;
  detailMeta.shootingDateTime = detailMeta.shootingDateTime
    ? new Date(detailMeta.shootingDateTime)
    : exif.DateTimeOriginal
    ? new Date(exif.DateTimeOriginal)
    : undefined;
  detailMeta.shootingOffsetTime = exif.OffsetTime ? exif.OffsetTime : undefined;
  detailMeta.recordedDateTime = detailMeta.shootingDateTime ?? null;

  applyAddressFields(detailMeta, location);
}

function applyAddressFields(
  detailMeta: Record<string, any>,
  locationInfo: any
) {
  if (!("country" in detailMeta)) {
    detailMeta["country"] =
      !locationInfo || !locationInfo.address || !locationInfo.address["country"]
        ? "Unknown"
        : resolveCountryCode(locationInfo.address["country"]) ||
          locationInfo.address["country"];
  } else if (detailMeta.country.length > 2) {
    detailMeta.country =
      resolveCountryCode(detailMeta["country"]) || detailMeta.country;
  }

  const addressFields = ["tourism", "amenity", "city", "county"];
  addressFields.forEach((key) => {
    if (!(key in detailMeta) || detailMeta[key] === "") {
      detailMeta[key] =
        !locationInfo || !locationInfo.address || !locationInfo.address[key]
          ? ""
          : locationInfo.address[key];
    }
  });

  if (!detailMeta.state || detailMeta.state === "") {
    if (!locationInfo || !locationInfo.address) {
      detailMeta.state = "";
    } else {
      detailMeta.state =
        locationInfo.address["state"] ||
        locationInfo.address["province"] ||
        locationInfo.address["region"] ||
        locationInfo.address["department"] ||
        locationInfo.address["county"] ||
        detailMeta.city ||
        "";
      detailMeta.state = detailMeta.state.replace(/ Prefecture$/, "");
      detailMeta.state = detailMeta.state.replace(/ Province$/, "");
    }
  }
}

const orientationLabelToValue: Record<string, number> = {
  "Horizontal (normal)": 1,
  "Mirror horizontal": 2,
  "Rotate 180": 3,
  "Mirror vertical": 4,
  "Mirror horizontal and rotate 270 CW": 5,
  "Rotate 90 CW": 6,
  "Mirror horizontal and rotate 90 CW": 7,
  "Rotate 270 CW": 8,
};
export function getOrientationValue(label: string): number {
  return orientationLabelToValue[label] ?? 1;
}
