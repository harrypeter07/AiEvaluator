import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./Providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const roboto = Roboto({
	weight: "300",
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
		icon: [
			{ url: "/logo3.png", type: "image/png", sizes: "256x256" },
			{ url: "/logo3.png", type: "image/png", sizes: "128x128" },
			{ url: "/logo3.png", type: "image/png", sizes: "96x96" },
			{ url: "/logo3.png", type: "image/png", sizes: "48x48" },
			{ url: "/logo3.png", type: "image/png", sizes: "32x32" },
			{ url: "/logo3.png", type: "image/png", sizes: "16x16" },
			{ url: "/favicon.ico", sizes: "any" },
		],
		shortcut: [{ url: "/logo3.png", type: "image/png", sizes: "256x256" }],
		apple: [
			{ url: "/logo3.png", sizes: "256x256" },
			{ url: "/logo3.png", sizes: "180x180" },
		],
		other: [
			{
				rel: "icon",
				type: "image/png",
				sizes: "256x256",
				url: "/logo3.png",
			},
		],
	},
	manifest: "/manifest.json",
	openGraph: {
		title: "AiEvaluator - Smart Assignment Evaluation",
		description: "AI-powered assignment evaluation and feedback system",
		images: [
			{
				url: "/logo3.png",
				width: 1200,
				height: 1200,
				alt: "AiEvaluator Logo",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "AiEvaluator - Smart Assignment Evaluation",
		description: "AI-powered assignment evaluation and feedback system",
		images: ["/logo3.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="scroll-smooth">
			<body
				className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-blue-50 to-white min-h-screen font-bold`}
			>
				<AuthProvider>
					<Navbar />
					<main className="flex flex-col min-h-screen pt-16">{children}</main>
					<Footer />
				</AuthProvider>
			</body>
		</html>
	);
}
