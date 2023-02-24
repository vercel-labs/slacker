import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import Meta from "./meta";

export default function Layout({
  meta,
  children,
}: {
  meta?: {
    title?: string;
    description?: string;
    image?: string;
  };
  children: ReactNode;
}) {
  return (
    <>
      <Meta {...meta} />
      <div className="fixed top-0 w-full z-10 transition-all">
        <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.svg"
              alt="Precedent logo"
              width="25"
              height="25"
            />
            <p className="bg-white bg-clip-text text-2xl font-medium tracking-tight text-transparent">
              Slacker
            </p>
          </Link>
          <a
            href="https://github.com/vercel-labs/slacker"
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden rounded-full w-32 px-10 py-4 focus:outline-none focus:ring-0"
            // This is a workaround hack to make overflow-hidden work on Safari: https://github.com/tailwindlabs/tailwindcss/discussions/5675
            style={{
              WebkitMaskImage: "-webkit-radial-gradient(white, black);",
            }}
          >
            <span className="absolute inset-px z-10 grid place-items-center rounded-full bg-black bg-gradient-to-t from-neutral-800 text-neutral-400 text-sm">
              View the code
            </span>
            <span
              aria-hidden
              className="absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-disco before:bg-gradient-conic before:from-purple-200 before:via-gray-900 before:to-[#444]"
            />
          </a>
        </div>
      </div>
      <main className="w-full min-h-screen flex flex-col items-center justify-center py-20 bg-gradient-radial from-[#532a01] via-[#180c00] to-black">
        {children}
      </main>
      <div className="flex space-x-4 fixed bottom-2 right-4">
        <Link
          href="/support"
          className="text-gray-400 hover:text-gray-200 text-sm"
        >
          Support
        </Link>
        <Link
          className="text-gray-400 hover:text-gray-200 text-sm"
          href="/privacy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </Link>
      </div>
    </>
  );
}
