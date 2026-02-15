import { MenuIcon, SearchIcon } from "lucide-react";

import Logo from "@/components/shadcn-studio/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavigationItem = {
  href: string;
  title: string;
}[];

const Navbar = ({ navigationData }: { navigationData: NavigationItem }) => {
  return (
    <header className="bg-background sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-7 sm:px-6">
        <div className="text-muted-foreground flex flex-1 items-center gap-8 font-medium md:justify-center lg:gap-16">
          <a className="hover:text-primary max-md:hidden" href="#">
            Home
          </a>
          <a className="hover:text-primary max-md:hidden" href="#">
            Products
          </a>
          <a href="#">
            <Logo className="text-foreground gap-3" />
          </a>
          <a className="hover:text-primary max-md:hidden" href="#">
            About Us
          </a>
          <a className="hover:text-primary max-md:hidden" href="#">
            Contacts
          </a>
        </div>

        <div className="flex items-center gap-6">
          <Button size="icon" variant="ghost">
            <SearchIcon />
            <span className="sr-only">Search</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button size="icon" variant="outline">
                <MenuIcon />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                {navigationData.map((item, index) => (
                  <DropdownMenuItem key={index}>
                    <a href={item.href}>{item.title}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
