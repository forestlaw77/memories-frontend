// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import { FunctionComponent, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";

interface DesktopProps {
  children: ReactNode;
}

/*
const Desktop = ({ children }: DesktopProps) => {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  return isDesktop ? children : null;
};
*/

export const Desktop: FunctionComponent<DesktopProps> = ({
  children,
}: DesktopProps) => {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  return isDesktop ? <>{children}</> : null;
};

interface MobileProps {
  children: ReactNode;
}

/*
const Mobile = ({ children }: MobileProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return isMobile ? children : null;
};
*/

export const Mobile: FunctionComponent<MobileProps> = ({
  children,
}: MobileProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return isMobile ? <>{children}</> : null;
};
