import { Link, useLocation } from "react-router-dom";
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
    const { pathname } = useLocation();
    const href = to;
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname?.startsWith(href);
    const isPending = false;

    return (
      <Link
        ref={ref as any}
        to={href}
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
