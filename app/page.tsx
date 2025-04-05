"use client";

import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();
	const words = [
		{
			text: "Evaluate",
			className: "text-blue-600",
		},
		{
			text: "assignments",
			className: "text-purple-600",
		},
		{
			text: "with",
			className: "text-pink-600",
		},
		{
			text: "AI",
			className: "text-red-600",
		},
	];

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
			</div>
			<p className="relative mb-4 text-xl font-bold text-gray-700 sm:mb-6 sm:text-2xl md:text-3xl dark:text-gray-200 animate-fade-in">
				The future of assignment evaluation starts here
			</p>
			<div className="relative max-w-3xl px-4">
				<TypewriterEffectSmooth
					words={words}
					className="text-3xl font-bold text-center sm:text-4xl md:text-5xl lg:text-6xl"
					cursorClassName="bg-blue-600"
				/>
			</div>
			<div className="relative flex flex-col mt-4 space-y-4 sm:flex-row sm:mt-8 sm:space-y-0 sm:space-x-4">
				<button
					onClick={() => router.push("/dashboard")}
					className="w-40 h-12 text-sm text-white transition-all duration-300 border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl dark:border-white hover:scale-105 hover:shadow-lg hover:from-indigo-600 hover:to-blue-600"
				>
					Get Started
				</button>
				<button
					onClick={() => router.push("/about")}
					className="w-40 h-12 text-sm text-white transition-all duration-300 border border-transparent bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl hover:scale-105 hover:shadow-lg hover:from-emerald-600 hover:to-teal-600"
				>
					Learn More
				</button>
			</div>
		</div>
	);
}
