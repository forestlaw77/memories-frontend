// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

"use client";

import { Breadcrumb, Separator } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { FcHome } from "react-icons/fc";

interface DynamicBreadcrumbProps {
  backLinkOverride?: string; // オプションで戻り先リンクを指定
}

const DynamicBreadcrumb = ({ backLinkOverride }: DynamicBreadcrumbProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const hrefBase = `/${pathSegments.slice(0, index + 1).join("/")}`;

    // 一覧ページ（第2階層）にだけ状態付きリンクを反映する
    const href =
      index === 0 && backLinkOverride
        ? backLinkOverride
        : index === pathSegments.length - 1
        ? hrefBase
        : `${hrefBase}${queryString ? `?${queryString}` : ""}`;

    const isLast = index === pathSegments.length - 1;

    return (
      <Breadcrumb.Item key={href}>
        {isLast ? (
          <Breadcrumb.CurrentLink>
            {decodeURIComponent(segment)}
            {searchParams.has("page") && index === 0 && (
              <span style={{ marginLeft: 4, color: "#888" }}>
                (p.{searchParams.get("page")})
              </span>
            )}
          </Breadcrumb.CurrentLink>
        ) : (
          <Breadcrumb.Link as={NextLink} href={href}>
            {decodeURIComponent(segment)}
          </Breadcrumb.Link>
        )}
      </Breadcrumb.Item>
    );
  });

  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link as={NextLink} href="/">
            <FcHome />
          </Breadcrumb.Link>
        </Breadcrumb.Item>

        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={`breadcrumb-${index}`}>
            <Breadcrumb.Separator key={`sep-${index}`} />
            {breadcrumb}
          </React.Fragment>
        ))}
      </Breadcrumb.List>

      <Separator my={4} />
    </Breadcrumb.Root>
  );
};

export default DynamicBreadcrumb;
