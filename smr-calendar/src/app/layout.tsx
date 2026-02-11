import "./globals.css";
import Providers from "./providers";
import "./fullcalendar.css";



export const metadata = {
  title: "SMR Prime Rentals – Availability",
  description: "Check availability and request bookings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
