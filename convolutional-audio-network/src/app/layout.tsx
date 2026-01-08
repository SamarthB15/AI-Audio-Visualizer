import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes"; // We use the dark theme for the login box
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "AI Audio Visulizer",
  description: "Deep Learning Audio Analysis with Convolutional Neural Network",
  icons: [{ rel: "icon", url: "/imagelogo.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We apply the Dark Theme to Clerk so the popup matches your app
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`font-sans ${inter.variable} bg-neutral-950`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}