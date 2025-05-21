"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { isLoggedIn } from "../services/authService";

export function NavigationMenuDemo() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  React.useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  // Don't render menu items on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <NavigationMenu className="navbar-menu">
      <NavigationMenuList className="navbar-list items-center">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/home" className={navigationMenuTriggerStyle()}>
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {loggedIn && (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/search" className={navigationMenuTriggerStyle()}>
                  Search
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/upload" className={navigationMenuTriggerStyle()}>
                  Upload
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/history" className={navigationMenuTriggerStyle()}>
                  History
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/research-collection"
                  className={navigationMenuTriggerStyle()}
                >
                  Collection
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/graph-view" className={navigationMenuTriggerStyle()}>
                  Graph View
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
