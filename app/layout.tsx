import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./Providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const roboto = Roboto({
	weight: "700",
	variable: "--font-roboto",
	subsets: ["latin"],
});

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "AiEvaluator - Smart Assignment Evaluation",
	description: "AI-powered assignment evaluation and feedback system",
	icons: {
		icon: "/logo.png",
		shortcut: "/logo.png",
		apple: "/logo.png",
	},
	openGraph: {
		title: "AiEvaluator - Smart Assignment Evaluation",
		description: "AI-powered assignment evaluation and feedback system",
		images: [
			{
				url: "/logo.png",
				width: 800,
				height: 800,
				alt: "AiEvaluator Logo",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "AiEvaluator - Smart Assignment Evaluation",
		description: "AI-powered assignment evaluation and feedback system",
		images: ["/logo.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-blue-50 min-h-screen font-bold`}
			>
				<AuthProvider>
					<Navbar />
					<main className="pt-16 min-h-screen">{children}</main>
					<Footer />
				</AuthProvider>
			</body>
		</html>
	);
}
