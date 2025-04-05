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

			{/* Feature Highlights */}
			<div className="relative max-w-4xl px-6 mt-8">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<div className="p-6 shadow-lg bg-white/90 rounded-xl backdrop-blur-sm">
						<div className="mb-4 text-blue-600">
							<svg
								className="w-8 h-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-semibold">Batch Evaluation</h3>
						<p className="text-gray-600">
							Evaluate all student submissions with just one click. Save hours
							of manual grading time.
						</p>
					</div>

					<div className="p-6 shadow-lg bg-white/90 rounded-xl backdrop-blur-sm">
						<div className="mb-4 text-purple-600">
							<svg
								className="w-8 h-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
								/>
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-semibold">
							Personalized Feedback
						</h3>
						<p className="text-gray-600">
							AI-powered detailed feedback for each student, focusing on their
							unique strengths and areas for improvement.
						</p>
					</div>

					<div className="p-6 shadow-lg bg-white/90 rounded-xl backdrop-blur-sm">
						<div className="mb-4 text-pink-600">
							<svg
								className="w-8 h-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-semibold">Smart Analytics</h3>
						<p className="text-gray-600">
							Track student progress, identify patterns, and get insights to
							improve teaching effectiveness.
						</p>
					</div>
				</div>

				<div className="mt-8 text-center">
					<p className="max-w-2xl mx-auto mb-4 text-lg text-gray-600">
						Empowering educators to focus on what matters most - teaching and
						mentoring. Our AI assistant handles the grading while maintaining
						high standards of assessment quality.
					</p>
				</div>
			</div>

			<div className="relative flex flex-col mt-8 space-y-4 sm:flex-row sm:mt-8 sm:space-y-0 sm:space-x-4">
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
