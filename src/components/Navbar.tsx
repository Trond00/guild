"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/roster", label: "Roster" },
    { href: "/progression", label: "Progression" },
    { href: "/raid-art", label: "Raid-Art" },
    { href: "/news", label: "News" },
    { href: "/recruitment", label: "Recruitment" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-md border-b border-red-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-red-500">
              ExPurged
            </Link>
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-red-400 border-b-2 border-red-400"
                    : "text-gray-300 hover:text-red-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
