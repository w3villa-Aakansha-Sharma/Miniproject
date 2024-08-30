'use client'; // Only include this if the component truly needs to be a client component

import { Inter } from "next/font/google";
import { metadata } from "../app/metadata"; // Import metadata from a separate file if needed

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
