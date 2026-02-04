"use client";

import React from "react";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/buttonta";
import { useAuth } from "@/app/user/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleBookNow = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/user/scheduler");
    }
  };

  return (
    <main className="overflow-hidden">
      <section className="relative">
        <div className="relative py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
              <h1 className="mt-8 text-4xl font-semibold md:text-5xl xl:text-5xl xl:[line-height:1.125]">
                Book. Manage. Thrive. <br /> Campus Resources Simplified.
              </h1>

              <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block">
                A fully customizable platform for managing and booking
                university resources, built to work exactly the way you need.
              </p>

              <p className="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">
                Example phrase to be replaced.
              </p>

              <div className="mt-8">
                <Button size="lg" onClick={handleBookNow} disabled={loading}>
                  <Rocket className="relative size-4" />
                  <span className="text-nowrap">Book now</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
