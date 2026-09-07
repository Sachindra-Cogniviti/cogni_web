// Font loader. next/font downloads and self-hosts the files at build time,
// so the exported site never calls Google Fonts at runtime.
import { Geist_Mono, Inter } from "next/font/google"

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})
