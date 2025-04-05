"use client";

export default function AboutUs() {
	return (
		<div className="min-h-screen px-4 py-12 bg-teal-custom sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="mb-16 text-center">
					<h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
						About AI Evaluator
					</h1>
					<p className="mt-4 text-xl text-gray-500">
						Revolutionizing education through intelligent assignment evaluation
					</p>
				</div>

				<div className="grid items-center grid-cols-1 gap-12 mb-20 md:grid-cols-2">
					<div>
						<h2 className="mb-6 text-3xl font-bold text-gray-900">
							Our Mission
						</h2>
						<p className="mb-6 text-lg text-gray-600">
							AI Evaluator is dedicated to transforming the educational
							landscape by leveraging cutting-edge AI technology to make
							assignment evaluation more efficient, consistent, and insightful
							for educators and students alike.
						</p>
						<p className="text-lg text-gray-600">
							We believe in creating tools that not only save time but also
							provide valuable feedback that helps students grow and improve.
						</p>
					</div>
					<div className="p-8 text-white rounded-lg shadow-xl bg-gradient-to-r from-teal-500 to-blue-500">
						<h3 className="mb-6 text-2xl font-semibold">Key Features</h3>
						<ul className="space-y-4">
							<li className="flex items-center">
								<svg
									className="w-6 h-6 mr-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>Intelligent Assignment Analysis</span>
							</li>
							<li className="flex items-center">
								<svg
									className="w-6 h-6 mr-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>Google Classroom Integration</span>
							</li>
							<li className="flex items-center">
								<svg
									className="w-6 h-6 mr-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>Detailed Feedback Generation</span>
							</li>
							<li className="flex items-center">
								<svg
									className="w-6 h-6 mr-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span>Real-time Progress Tracking</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="p-8 mb-20 bg-white rounded-lg shadow-lg">
					<h2 className="mb-8 text-3xl font-bold text-center text-gray-900">
						Why Choose AI Evaluator?
					</h2>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div className="text-center">
							<div className="flex items-center justify-center w-16 h-16 p-4 mx-auto mb-4 bg-teal-100 rounded-full">
								<svg
									className="w-8 h-8 text-teal-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 text-xl font-semibold text-gray-900">
								Smart & Efficient
							</h3>
							<p className="text-gray-600">
								Advanced AI-powered grading that reduces evaluation time by up
								to 70%
							</p>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center w-16 h-16 p-4 mx-auto mb-4 bg-teal-100 rounded-full">
								<svg
									className="w-8 h-8 text-teal-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 text-xl font-semibold text-gray-900">
								Secure & Reliable
							</h3>
							<p className="text-gray-600">
								State-of-the-art security ensuring your academic data is
								protected
							</p>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center w-16 h-16 p-4 mx-auto mb-4 bg-teal-100 rounded-full">
								<svg
									className="w-8 h-8 text-teal-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</div>
							<h3 className="mb-2 text-xl font-semibold text-gray-900">
								Continuous Learning
							</h3>
							<p className="text-gray-600">
								Our AI system evolves and improves with each evaluation
							</p>
						</div>
					</div>
				</div>

				<div className="text-center">
					<h2 className="mb-8 text-3xl font-bold text-gray-900">
						Ready to Transform Your Assessment Process?
					</h2>
					<a
						href="/signup"
						className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-colors bg-teal-600 border border-transparent rounded-md hover:bg-teal-700"
					>
						Start Using AI Evaluator
					</a>
				</div>
			</div>
		</div>
	);
}
