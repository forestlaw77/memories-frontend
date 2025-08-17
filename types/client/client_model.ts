/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { ResourceFetcher } from "@/libs/api/resource_fetcher";

export enum RESOURCE_TYPE {
  BOOKS = "books",
  DOCUMENTS = "documents",
  IMAGES = "images",
  MUSIC = "music",
  VIDEOS = "videos",
}

export enum THUMBNAIL_SIZE {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  ORIGINAL = "original",
}

//export type ResourceType = RESOURCE_TYPE;

export type ResourceMetaMap = {
  [RESOURCE_TYPE.BOOKS]: ResourceMeta<BaseContentMeta, BookDetailMeta>[];
  [RESOURCE_TYPE.DOCUMENTS]: ResourceMeta<
    BaseContentMeta,
    DocumentDetailMeta
  >[];
  [RESOURCE_TYPE.IMAGES]: ResourceMeta<ImageContentMeta, ImageDetailMeta>[];
  [RESOURCE_TYPE.MUSIC]: ResourceMeta<MusicContentMeta, MusicDetailMeta>[];
  [RESOURCE_TYPE.VIDEOS]: ResourceMeta<BaseContentMeta, VideoDetailMeta>[];
};

export type ResourceTypeToMetaMap = {
  [RESOURCE_TYPE.BOOKS]: { content: BaseContentMeta; detail: BookDetailMeta };
  [RESOURCE_TYPE.DOCUMENTS]: {
    content: BaseContentMeta;
    detail: DocumentDetailMeta;
  };
  [RESOURCE_TYPE.IMAGES]: {
    content: ImageContentMeta;
    detail: ImageDetailMeta;
  };
  [RESOURCE_TYPE.MUSIC]: { content: MusicContentMeta; detail: MusicDetailMeta };
  [RESOURCE_TYPE.VIDEOS]: { content: BaseContentMeta; detail: VideoDetailMeta };
};

export interface ResourceMeta<
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
> {
  basicMeta: BasicMeta<TContentMeta>; // 基本メタデータ
  detailMeta?: TDetailMeta; // 詳細メタデータ
}

export interface BasicMeta<T extends BaseContentMeta> {
  resourceId: string; // リソースID
  resourceType: RESOURCE_TYPE; // リソースタイプ
  createdAt: Date | null; // 登録日時
  updatedAt: Date | null; // 更新日時
  contents: T[]; // コンテンツメタデータリスト
  childResourceIds?: string[]; // リソース内の子リソース
  parentResourceIds?: string[]; // 親リソース
}

export interface BaseContentMeta {
  contentId: number; // コンテンツID
  filename: string; // ファイル名
  mimetype: string; // MIMEタイプ
  hash: string | null; // ハッシュ値
  size: number | null; // サイズ
  createdAt: Date | null; // 登録日時
  updatedAt: Date | null; // 更新日時
}

export interface MusicContentMeta extends BaseContentMeta {
  title?: string; // 曲名
  artist?: string; // アーティスト名
  album?: string; // アルバム名
  genre?: string; // ジャンル
  releaseDate?: Date; // リリース日
  duration?: string; // 再生時間 "00:00:00"
  trackNumber?: string; // トラックID no of
  diskNumber?: string; // ディスク番号 no of
  fileType?: string; // 拡張子
}

export interface ImageContentMeta extends BaseContentMeta {
  latitude?: number;
  longitude?: number;
  address?: string | null;
  shootingDateTime?: Date;
  shootingOffsetTime?: string;
}

export interface BaseDetailMeta {
  resourceId: string;
  title: string | null;
  description: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  storageLocation: string | null;
  recordedDateTime: Date | null;
}

export interface BookDetailMeta extends BaseDetailMeta {
  author?: string;
  publishedAt?: Date;
  publisher?: string;
  isbn?: string;
  coverImageUrl?: string;
  sourceBookUrl?: string;
}

export interface DocumentDetailMeta extends BaseDetailMeta {
  creator?: string;
}

export interface ImageDetailMeta extends BaseDetailMeta {
  shootingDateTime?: Date;
  shootingOffsetTime?: string;
  address?: string | null;
  amenity?: string;
  tourism?: string;
  orientation?: number;
}

export interface MusicDetailMeta extends BaseDetailMeta {
  artist?: string;
  album?: string;
  genre?: string;
  releaseDate?: Date;
  duration?: number;
  trackCount?: number;
  fileType?: string; // 拡張子
  coverImageUrl?: string;
}

export interface VideoDetailMeta extends BaseDetailMeta {
  shootingDateTime?: Date;
  shootingOffsetTime?: string;
  address?: string | null;
  amenity?: string;
  tourism?: string;
}

export interface AccessLog {
  resourceType: RESOURCE_TYPE; // リソース種別
  resourceId: string; // アクセス対象リソース
  contentId?: number; // コンテンツ単位のアクセス記録（オプション）
  timestamp: number; // アクセス日時
  userId?: string; // ユーザー識別（オプション）
}

export interface ViewComponentProps<T extends BaseContentMeta> {
  contentMeta: T | null;
  resourceId: string;
  contentId: number;
  fetcher: ResourceFetcher<
    RESOURCE_TYPE,
    BaseContentMeta | ImageContentMeta | MusicContentMeta,
    | BookDetailMeta
    | DocumentDetailMeta
    | ImageDetailMeta
    | MusicDetailMeta
    | VideoDetailMeta
  > | null;
}

export interface ContentListComponentProps<T extends BaseContentMeta> {
  resourceType: RESOURCE_TYPE;
  resourceId: string;
  thumbnailUrl: string | null | undefined;
  contents: T[];
}
