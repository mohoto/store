"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "../../../../public/images/logo.png";
import { CartDrawer } from "../cart/cart-drawer";
import { WishlistIcon } from "../../store/wishlist-icon";
import { NavMenu } from "./nav-menu";
import { NavBarMobile } from "./nav-menu-mobile";

export const Header = () => {
  const isMobile = useIsMobile();
  const [navSticky, setNavSticky] = useState<boolean>(false);

  useEffect(() => {
    window.document.addEventListener("scroll", () => {
      if (window.scrollY > 170) {
        setNavSticky(true);
      } else {
        setNavSticky(false);
      }
    });
    /* window.document.addEventListener('scroll', () => {
        setSubnav(0);
    }); */
  });

  return (
    <header
      className={cn(
        "px-6 lg:px-32",
        navSticky
          ? "fixed top-0 z-50 w-full transition duration-500 ease-in-out shadow-lg bg-white border-b py-2"
          : "bg-white py-2"
      )}
    >
      {/* <div className="bg-black text-white flex justify-center py-4 w-full px-2">
        <p className="text-center">
          -20% sur votre première commande avec le code IWSTORE20
        </p>
      </div> */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image src={Logo} alt="" className="w-36 h-auto" />
          </Link>
          {!isMobile ? <NavMenu /> : <NavBarMobile />}
          <div className="flex items-center gap-3">
            <WishlistIcon />
            <CartDrawer />

            {/* Mobile Menu */}
            <div className="md:hidden"></div>
          </div>
        </div>
      </nav>
    </header>
  );
};
