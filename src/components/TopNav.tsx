"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const ITEMS = [
  { href: "/", label: "Today" },
  { href: "/habits", label: "Manage" },
  { href: "/stats", label: "Stats" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between border-b hairline pb-4 mb-10">
      <Link href="/" className="serif italic text-xl tracking-tight">
        habits.
      </Link>
      <div className="flex items-center gap-6 text-[11px] tracking-[0.22em] uppercase">
        {ITEMS.map((it) => {
          const active =
            it.href === "/"
              ? pathname === "/"
              : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                active
                  ? "text-ink border-b border-ink pb-1"
                  : "text-muted hover:text-ink transition-colors pb-1"
              }
            >
              {it.label}
            </Link>
          );
        })}
        <ThemeToggle />
        <button
          onClick={logout}
          aria-label="Sign out"
          className="text-soft hover:text-ink transition-colors"
        >
          ⏻
        </button>
      </div>
    </nav>
  );
}
