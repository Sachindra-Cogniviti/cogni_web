// Font loader. next/font downloads and self-hosts the files at build time,
// so the exported site never calls Google Fonts at runtime.
//
// The three faces come from the "Cogniviti Labs v1" design:
//   Archivo       - all UI and display type
//   IBM Plex Mono - kickers, labels, data readouts, clocks
//   Newsreader    - italic only, for the accent words "systems" and "between".
//                   This is the typographic signature of the page: it exists to
//                   contrast with Archivo, so it has to stay a serif italic.
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google"

export const fontSans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// IBM Plex Mono is not a variable font, so weights are listed explicitly.
export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
})

// Loaded italic-only: the design never sets Newsreader upright.
export const fontSerif = Newsreader({
  subsets: ["latin"],
  style: "italic",
  variable: "--font-serif",
  display: "swap",
})
