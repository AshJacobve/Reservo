"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/cardta";
import { Settings2, Sparkles, Zap } from "lucide-react";
import { ReactNode, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowRight, Menu, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/buttonta";
import { useAuth } from "../app/user/context/AuthContext";
import { signOutUser } from "@/public/snippets/front-end-auth-functions";

const menuItems = [
  { name: "About", href: "/features" },
  { name: "My Schedule", href: "/scheduler" },
  { name: "Contact Us", href: "/contact" },
];

export default function Features() {
  const [menuState, setMenuState] = useState(false);
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* 🔥 HEADER REMOVED – now your global <Header /> will apply */}

      <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
        <div className="@container mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
              Choose from an array of facilities
            </h2>
            <p className="mt-4">
              We offer a number of facilities to aid in your education.
            </p>
          </div>

          <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
            <Card className="group shadow-zinc-950/5">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Zap className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">Comp. Sci Labs</h3>
              </CardHeader>

              <CardContent>
                <p className="text-sm">
                  Book computer labs equipped with the latest software and
                  hardware for your programming and development needs.
                </p>
              </CardContent>
            </Card>

            <Card className="group shadow-zinc-950/5">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Settings2 className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">Music Practice Rooms</h3>
              </CardHeader>

              <CardContent>
                <p className="mt-3 text-sm">
                  Reserve soundproof practice rooms equipped with pianos and
                  music stands for individual or ensemble rehearsals.
                </p>
              </CardContent>
            </Card>

            <Card className="group shadow-zinc-950/5">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Sparkles className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">Classrooms</h3>
              </CardHeader>

              <CardContent>
                <p className="mt-3 text-sm">
                  Reserve classrooms for group study sessions, project meetings,
                  or student organization activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
    />

    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
);
