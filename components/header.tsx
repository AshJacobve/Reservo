"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/app/user/context/AuthContext";
import { signOutUser } from "@/public/snippets/front-end-auth-functions";
import { useRouter } from "next/navigation";

const menuItems = [
  { name: "About", href: "/user/features" },
  { name: "My Schedule", href: "/user/scheduler" },
  { name: "My Bookings", href: "/user/dashboard" },
  { name: "Profile", href: "/user/profile" },
  { name: "Contact Us", href: "/user/contact" },
];

export default function Header() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOutUser();
    router.push("/");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold text-lg">SOEN</span>
            </Link>
          </div>
          <nav className="hidden md:flex md:space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-500 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block">
            {!loading &&
              (user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-transparent rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 border border-transparent rounded-md text-base font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  Login
                </Link>
              ))}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2">
              {!loading &&
                (user ? (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Login
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
