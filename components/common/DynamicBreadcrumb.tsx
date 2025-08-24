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

import { Breadcrumb, Separator } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { FcHome } from "react-icons/fc";

/**
 * Props for the {@link DynamicBreadcrumb} component.
 *
 * @property pathname - Optional pathname to override the current route. Useful for Storybook or testing.
 * @property searchParams - Optional URLSearchParams to override query parameters. Enables reproducible routing state.
 * @property backLinkOverride - Optional override for the first breadcrumb link (typically used for "back" navigation).
 */
export interface DynamicBreadcrumbProps {
  pathname?: string;
  searchParams?: URLSearchParams;
  backLinkOverride?: string;
}

/**
 * Renders a dynamic breadcrumb trail based on the current pathname and search parameters.
 * Falls back to Next.js routing hooks if props are not provided, enabling seamless integration
 * with both runtime and testing environments.
 *
 * - The first segment can be overridden with `backLinkOverride`.
 * - Intermediate segments preserve query parameters (e.g., `?page=2`) for reproducibility.
 * - The last segment is rendered as plain text.
 *
 * @param props - {@link DynamicBreadcrumbProps}
 * @returns A breadcrumb UI component with Chakra UI styling.
 */
const DynamicBreadcrumb = ({
  pathname: injectedPathname,
  searchParams: injectedSearchParams,
  backLinkOverride,
}: DynamicBreadcrumbProps) => {
  const pathname = injectedPathname ?? usePathname();
  const searchParams = injectedSearchParams ?? useSearchParams();
  const queryString = searchParams.toString();

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const hrefBase = `/${pathSegments.slice(0, index + 1).join("/")}`;

    // Apply query string only to intermediate segments
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
