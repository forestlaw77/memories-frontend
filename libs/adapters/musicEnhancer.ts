/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 *
 * @module MusicEnhancer
 * @description
 * Provides utility functions to enhance metadata for music resources.
 */

import {
  BasicMeta,
  MusicContentMeta,
  MusicDetailMeta,
} from "@/types/client/client_model";
import { ServerBasicMeta } from "@/types/server/server_model";
import { getCountryCenter } from "../maps/country_center_map";

/**
 * Enhances the metadata of a music resource with additional information.
 *
 * This function uses EXIF data and default latitude/longitude for countries to
 * supplement missing metadata fields.
 *
 * @param {BasicMeta<MusicContentMeta>} basicMeta - The client's basic metadata object.
 * @param {MusicDetailMeta} detailMeta - The detail metadata object for the music resource.
 * @param {ServerBasicMeta} serverBasicMeta - The server's basic metadata object.
 */
export function enhanceMusicMeta(
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
