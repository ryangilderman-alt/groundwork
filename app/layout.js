import { DM_Mono, Syne } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"] });
const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmMono.className} ${syne.variable}`} style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
