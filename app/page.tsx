"use client";

import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

export default function Home() {
	const words = [
		{
			text: "Evaluate",
			className: "text-blue-500",
		},
		{
			text: "assignments ",
			className: "text-purple-500",
		},
		{
			text: "with ",
			className: "text-pink-500",
		},
		{
			text: "AI ",
			className: "text-red-500",
		},
		{
			text: "power.",
			className: "text-yellow-500",
		},
	];

	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
			<p className="mb-4 text-sm font-light text-neutral-600 dark:text-neutral-200 sm:text-lg">
				The future of assignment evaluation starts here
			</p>
			<TypewriterEffectSmooth
				words={words}
				className="text-4xl font-bold text-center"
				cursorClassName="bg-blue-500"
			/>
			<div className="flex flex-col mt-8 space-x-0 space-y-4 md:flex-row md:space-y-0 md:space-x-4">
				<button className="w-40 h-12 text-sm text-white bg-black rounded-xl border border-transparent transition-colors duration-300 dark:border-white hover:bg-gray-800">
					Get Started
				</button>
				<button className="w-40 h-12 text-sm text-black bg-white rounded-xl border border-black transition-colors duration-300 hover:bg-gray-100">
					Learn More
				</button>
			</div>
		</div>
	);
}
