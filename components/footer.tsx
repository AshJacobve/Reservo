import Link from "next/link";
import { Logo } from "@/components/logo";

const footerLinks = {
  company: [
    { name: "About Us", href: "/features" },
    { name: "Contact", href: "/contact" },
  ],
  product: [
    { name: "Scheduler", href: "/scheduler" },
    { name: "Features", href: "/features" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-dashed bg-white/90 backdrop-blur dark:bg-zinc-950/60">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Logo + Description */}
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-7 w-auto" />
            </Link>

            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A seamless platform for booking and managing campus facilities —
              built for students, faculty, and administrators.
            </p>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-accent-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-accent-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full border-t border-dashed" />

        {/* Bottom Section */}
        <div className="flex justify-center text-sm text-muted-foreground mt-6">
          <p>© {year} reservo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
