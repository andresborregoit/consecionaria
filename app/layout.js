import localFont from "next/font/local";
import "./globals.css";
import UsarContexto from './context/UsarContexto';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Car Control",
  description: "Dominio total del",
  manifest: "/manifest.json",
  icons:{
    apple: "/images/icon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UsarContexto>
          {children}
        </UsarContexto>
      </body>
    </html>
  );
}