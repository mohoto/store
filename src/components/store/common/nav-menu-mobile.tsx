"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconMenuDeep, IconSquareX } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

export const NavBarMobile = () => {
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  return (
    <div className="order-3">
      <Drawer direction="right" open={openMenu} onOpenChange={setOpenMenu}>
        <DrawerTrigger>
          <IconMenuDeep className="h-8 w-8" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex justify-end">
              <DrawerClose asChild>
                <IconSquareX className="h-8 w-8" />
              </DrawerClose>
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 flex flex-col text-lg gap-y-3">
            <div
              className="hover:bg-captive-primary focus:bg-captive-primary rounded-md p-2"
              onClick={() => setOpenMenu(false)}
            >
              <Link href="/">Accueil</Link>
            </div>
            <div
              className="hover:bg-captive-primary focus:bg-captive-primary rounded-md p-2"
              onClick={() => setOpenMenu(false)}
            >
              <Link href="/site-vitrine">Site vitrine</Link>
            </div>
            <div
              className="hover:bg-captive-primary focus:bg-captive-primary rounded-md p-2"
              onClick={() => setOpenMenu(false)}
            >
              <Link href="/e-commerce">Site e-commerce</Link>
            </div>
            <div
              className="hover:bg-captive-primary focus:bg-captive-primary rounded-md p-2"
              onClick={() => setOpenMenu(false)}
            >
              <Link href="/application-web">Application web</Link>
            </div>
            <div
              className="hover:bg-captive-primary focus:bg-captive-primary rounded-md p-2"
              onClick={() => setOpenMenu(false)}
            >
              <Link href="/tarifs">Tarifs</Link>
            </div>
            <div
              className="hover:bg-captive-primary focus:bg-captive-primary rounded-md p-2"
              onClick={() => setOpenMenu(false)}
            >
              <Link href="/contact">Nous contacter</Link>
            </div>
            <div
              className="hover:bg-captive-primary focus:bg-captive-primary rounded-md p-2"
              onClick={() => setOpenMenu(false)}
            >
              <Link href="/wishlist">Ma Wishlist</Link>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
