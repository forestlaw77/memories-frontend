/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import {
  BaseContentMeta,
  BaseDetailMeta,
  ResourceMeta,
} from "@/types/client/client_model";
import { createContext, ReactNode, useContext, useState } from "react";

export interface ResourceContextType<
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
> {
  resources: ResourceMeta<TContentMeta, TDetailMeta>[];
  setResources: React.Dispatch<
    React.SetStateAction<ResourceMeta<TContentMeta, TDetailMeta>[]>
  >;
}

const ResourceContext = createContext<
  ResourceContextType<BaseContentMeta, BaseDetailMeta> | undefined
>(undefined);

export function ResourceProvider<T extends BaseDetailMeta>({
  children,
}: {
  children: ReactNode;
}) {
  const [resources, setResources] = useState<
    ResourceMeta<BaseContentMeta, BaseDetailMeta>[]
  >([]);

  return (
    <ResourceContext.Provider value={{ resources, setResources }}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResourceContext<
  TContentMeta extends BaseContentMeta,
  TDetailMeta extends BaseDetailMeta
>() {
  const context = useContext(
    ResourceContext as React.Context<
      ResourceContextType<TContentMeta, TDetailMeta> | undefined
    >
  );
  if (!context) {
    throw new Error(
      "useResourceContext must be used within a ResourceProvider"
    );
  }
  return context;
}
