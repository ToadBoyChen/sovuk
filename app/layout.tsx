import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toddy",
  description: "Toby's Portfolio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col max-w-400 items-center mx-auto">
        {children}
      </body>
    </html>
  );
}
