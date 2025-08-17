/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

"use client";

import React, { createContext, useContext, useMemo } from "react";

/**
 * FetcherParamsContext で提供される値の型定義
 */
interface FetcherParams {
  accessToken: string | null | undefined;
  authToken: string | null | undefined;
  enableCache: boolean;
}

/**
 * FetcherParamsContext の作成
 * デフォルト値は undefined で、プロバイダ内で実際の値が提供される
 */
const FetcherParamsContext = createContext<FetcherParams | undefined>(
  undefined
);

/**
 * FetcherParamsProvider コンポーネント
 * アプリケーションのサブツリーに accessToken と authToken, enableCache を提供する
 *
 * @param {Object} props - children および accessToken, authToken, enableCache
 * @param {React.ReactNode} props.children - 子コンポーネント
 * @param {string | null | undefined} props.accessToken - 認証トークン
 * @param {string | null | undefined} props.authToken - 認証トークン（サーバーに合わせて accessToken, idToken を入れる）
 * @param {boolean} props.enableCache - キャッシュの有効/無効設定
 * @returns {JSX.Element} プロバイダでラップされた子コンポーネント
 */
export const FetcherParamsProvider = ({
  children,
  accessToken,
  authToken,
  enableCache,
}: React.PropsWithChildren<FetcherParams>) => {
  const value = useMemo(
    () => ({
      accessToken: accessToken,
      authToken: authToken,
      enableCache,
    }),
    [accessToken, authToken, enableCache]
  );

  return (
    <FetcherParamsContext.Provider value={value}>
      {children}
    </FetcherParamsContext.Provider>
  );
};

/**
 * useFetcherParams カスタムフック
 * FetcherParamsContext から accessToken と enableCache を取得するためのフック
 * プロバイダの外部で呼び出された場合はエラーをスロー
 *
 * @returns {FetcherParams} accessToken と authToken, enableCache を含むオブジェクト
 */
export const useFetcherParams = () => {
  const context = useContext(FetcherParamsContext);
  if (context === undefined) {
    throw new Error(
      "useFetcherParams must be used within a FetcherParamsProvider"
    );
  }
  return context;
};
