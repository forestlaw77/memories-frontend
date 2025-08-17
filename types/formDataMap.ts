/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { COUNTRY_OPTIONS } from "@/libs/maps/country_name_to_iso";
import {
  BaseContentMeta,
  BaseDetailMeta,
  RESOURCE_TYPE,
  ResourceMeta,
} from "./client/client_model";

export interface FormComponentProps<
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
> {
  resourceType: RESOURCE_TYPE;
  resourceId: string;
  resource: ResourceMeta<TContentMeta, TDetailMeta> | undefined;
}

export interface FieldConfig {
  fieldName: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "date"
    | "datetime-local"
    | "url"
    | "file"
    | "barcode"
    | "select";
  isSearchable: boolean;
  placeholder: string;
  options?: {
    label: string;
    value: string;
  }[];
}

export const resourceDataMap: Record<RESOURCE_TYPE, FieldConfig[]> = {
  books: [
    {
      fieldName: "title",
      label: "TITLE",
      type: "text",
      isSearchable: true,
      placeholder: "Enter book title",
    },
    {
      fieldName: "description",
      label: "DESCRIPTION",
      type: "text",
      isSearchable: false,
      placeholder: "Brief summary of the book",
    },
    {
      fieldName: "author",
      label: "AUTHOR",
      type: "text",
      isSearchable: true,
      placeholder: "Author's name",
    },
    {
      fieldName: "publishedAt",
      label: "PUBLICATION DATE",
      type: "date",
      isSearchable: true,
      placeholder: "YYYY-MM-DD",
    },
    {
      fieldName: "publisher",
      label: "PUBLISHER",
      type: "text",
      isSearchable: true,
      placeholder: "Publishing company",
    },
    {
      fieldName: "isbn",
      label: "ISBN",
      type: "barcode",
      isSearchable: true,
      placeholder: "13-digit ISBN code",
    },
    {
      fieldName: "coverImageUrl",
      label: "COVER IMAGE URL",
      type: "url",
      isSearchable: false,
      placeholder: "URL to book cover image",
    },
    {
      fieldName: "country",
      label: "COUNTRY",
      type: "select",
      isSearchable: false,
      placeholder: "Country of the book location",
      options: COUNTRY_OPTIONS,
    },
    {
      fieldName: "storageLocation",
      label: "STORAGE LOCATION",
      type: "text",
      isSearchable: false,
      placeholder: "Where the book is stored",
    },
    {
      fieldName: "sourceBookUrl",
      label: "BOOK URL",
      type: "url",
      isSearchable: false,
      placeholder: "Link to purchase or reference",
    },
  ],
  documents: [
    {
      fieldName: "title",
      label: "TITLE",
      type: "text",
      isSearchable: false,
      placeholder: "Document title",
    },
    {
      fieldName: "description",
      label: "DESCRIPTION",
      type: "textarea",
      isSearchable: false,
      placeholder: "Brief summary of the document",
    },
    {
      fieldName: "latitude",
      label: "LATITUDE",
      type: "text",
      isSearchable: false,
      placeholder: "Latitude of the document location",
    },
    {
      fieldName: "longitude",
      label: "LONGITUDE",
      type: "text",
      isSearchable: false,
      placeholder: "Longitude of the document location",
    },
    {
      fieldName: "country",
      label: "COUNTRY",
      type: "select",
      isSearchable: false,
      placeholder: "Country of the document location",
      options: COUNTRY_OPTIONS,
    },
    {
      fieldName: "storageLocation",
      label: "STORAGE LOCATION",
      type: "text",
      isSearchable: false,
      placeholder: "Where the document is stored",
    },
  ],
  images: [
    {
      fieldName: "title",
      label: "TITLE",
      type: "text",
      isSearchable: false,
      placeholder: "Image title",
    },
    {
      fieldName: "description",
      label: "DESCRIPTION",
      type: "textarea",
      isSearchable: false,
      placeholder: "Brief description of the image",
    },
    {
      fieldName: "latitude",
      label: "LATITUDE",
      type: "text",
      isSearchable: false,
      placeholder: "Latitude of the image location",
    },
    {
      fieldName: "longitude",
      label: "LONGITUDE",
      type: "text",
      isSearchable: false,
      placeholder: "Longitude of the image location",
    },
    {
      fieldName: "shootingDateTime",
      label: "SHOOTING DATE TIME",
      type: "datetime-local",
      isSearchable: false,
      placeholder: "Date and time when the image was taken",
    },
    {
      fieldName: "shootingOffsetTime",
      label: "OFFSET TIME",
      type: "text",
      isSearchable: false,
      placeholder: "Offset time from UTC (e.g., +09:00)",
    },
    {
      fieldName: "address",
      label: "ADDRESS",
      type: "text",
      isSearchable: false,
      placeholder: "Address where the image was taken",
    },
    {
      fieldName: "country",
      label: "COUNTRY",
      type: "select",
      isSearchable: false,
      placeholder: "Country of the image location",
      options: COUNTRY_OPTIONS,
    },
    {
      fieldName: "state",
      label: "STATE",
      type: "text",
      isSearchable: false,
      placeholder: "State or region of the image location",
    },
    {
      fieldName: "city",
      label: "CITY",
      type: "text",
      isSearchable: false,
      placeholder: "City of the image location",
    },
    {
      fieldName: "amenity",
      label: "AMENITY",
      type: "text",
      isSearchable: false,
      placeholder: "Amenity at the image location (e.g., park, museum)",
    },
    {
      fieldName: "tourism",
      label: "TOURISM",
      type: "text",
      isSearchable: false,
      placeholder: "Tourism information related to the image",
    },
    {
      fieldName: "storageLocation",
      label: "STORAGE LOCATION",
      type: "text",
      isSearchable: false,
      placeholder: "Where the photo is stored",
    },
  ],
  music: [
    {
      fieldName: "title",
      label: "TITLE",
      type: "text",
      isSearchable: false,
      placeholder: "Song or album title",
    },
    {
      fieldName: "description",
      label: "DESCRIPTION",
      type: "textarea",
      isSearchable: false,
      placeholder: "Brief summary of the music",
    },
    {
      fieldName: "artist",
      label: "ARTIST",
      type: "text",
      isSearchable: false,
      placeholder: "Artist Name",
    },
    {
      fieldName: "album",
      label: "ALBUM",
      type: "text",
      isSearchable: false,
      placeholder: "Album Name",
    },
    {
      fieldName: "genre",
      label: "GENRE",
      type: "text",
      isSearchable: false,
      placeholder: "genre",
    },
    {
      fieldName: "releaseDate",
      label: "RELEASE DATE",
      type: "date",
      isSearchable: false,
      placeholder: "Release date",
    },
    {
      fieldName: "duration",
      label: "DURATION",
      type: "text",
      isSearchable: false,
      placeholder: "Duration",
    },
    {
      fieldName: "trackCount",
      label: "NUMBER OF TRACKS",
      type: "text",
      isSearchable: false,
      placeholder: "Number of tracks",
    },
    {
      fieldName: "country",
      label: "COUNTRY",
      type: "select",
      isSearchable: false,
      placeholder: "Country of the music location",
      options: COUNTRY_OPTIONS,
    },
    {
      fieldName: "coverImageUrl",
      label: "COVER IMAGE URL",
      type: "url",
      isSearchable: false,
      placeholder: "URL to music cover image",
    },
    {
      fieldName: "storageLocation",
      label: "STORAGE LOCATION",
      type: "text",
      isSearchable: false,
      placeholder: "Where the music is stored",
    },
  ],
  videos: [
    {
      fieldName: "title",
      label: "TITLE",
      type: "text",
      isSearchable: false,
      placeholder: "Video title",
    },
    {
      fieldName: "description",
      label: "DESCRIPTION",
      type: "textarea",
      isSearchable: false,
      placeholder: "Brief summary of the video",
    },
    {
      fieldName: "country",
      label: "COUNTRY",
      type: "select",
      isSearchable: false,
      placeholder: "Country of the video location",
      options: COUNTRY_OPTIONS,
    },
    {
      fieldName: "storageLocation",
      label: "STORAGE LOCATION",
      type: "text",
      isSearchable: false,
      placeholder: "Where the video is stored",
    },
  ],
};
