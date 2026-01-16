import type { ReactNode } from "react";

type HomeLayoutProps = {
  children: ReactNode;
};

export default function HomeLayout({ children }: HomeLayoutProps) {
  // Simple pass-through layout for the (home) segment.
  // The root `layout.tsx` already defines <html> and <body>.
  return <>{children}</>;
}


