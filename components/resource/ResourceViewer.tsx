/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import { createFetcher } from "@/libs/api/resource_fetcher";
import { RESOURCE_TYPE } from "@/types/client/client_model";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

// リソースデータを取得するクエリ関数
async function fetchResourcesByType(
  resourceType: RESOURCE_TYPE,
  sessionToken: string
) {
  const fetcher = createFetcher(resourceType, false, sessionToken);
  if (!fetcher) {
    throw new Error(`Fetcher not available for ${resourceType}`);
  }
  const { resources } = await fetcher.getResources();
  return resources;
}

export default function ResourceViewer({
  resourceType,
}: {
  resourceType: RESOURCE_TYPE;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient(); // キャッシュ操作のために必要

  const {
    data: resources,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resources", resourceType, session?.authToken],
    queryFn: () =>
      fetchResourcesByType(resourceType, session?.authToken as string),
    enabled: !!session?.authToken && !!resourceType,
  });

  // リソースを更新するロジック（例: 新規追加、編集後）
  const handleResourceUpdate = async () => {
    // API を呼び出してリソースを更新...
    // 例: await fetcher.updateResource(...);

    // 更新後、関連するキャッシュを無効化して自動で再フェッチさせる
    await queryClient.invalidateQueries({
      queryKey: ["resources", resourceType],
    });
    // あるいは、全てのresourceのuserMetaも更新されたなら
    // await queryClient.invalidateQueries({ queryKey: ['userMeta'] });
  };

  if (isLoading) return <div>{resourceType} をロード中...</div>;
  if (isError) return <div>エラー: {error?.message}</div>;

  return (
    <div>
      <h2>{resourceType} リソース</h2>
      {resources &&
        resources.map((res: any) => (
          <div key={res.basicMeta.resourceId}>
            {res.basicMeta.title || res.basicMeta.resourceId}
          </div>
        ))}
      <button onClick={handleResourceUpdate}>リソースを更新</button>
    </div>
  );
}
