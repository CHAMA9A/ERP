"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type To = string;

interface NavLinkCompatProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: To;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const pathname = usePathname();
    const href = to;
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname?.startsWith(href);
    const isPending = false;

    return (
      <Link
        ref={ref as any}
        href={href}
        className={cn(className, isActive && activeClassName, isPending && pendingClassName)}
        {...props}
      >
        {props.children}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
