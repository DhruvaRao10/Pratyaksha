"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export function NavigationMenuDemo() {
  return (
    <NavigationMenu className="navbar-menu">
      <NavigationMenuList className="navbar-list">
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
            <Link to="/research-collection" className={navigationMenuTriggerStyle()}>
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
      </NavigationMenuList>
    </NavigationMenu>
  );
}