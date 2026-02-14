import "./globals.css";
import Providers from "./providers";
import "./fullcalendar.css";
import { Toaster } from "@/components/ui/toaster";



export const metadata = {
  title: "SMR Prime Rentals – Availability",
  description: "Check availability and request bookings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}