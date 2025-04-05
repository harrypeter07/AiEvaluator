export default function Footer() {
	return (
		<footer className="bg-white border-t">
			<div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div className="col-span-1 md:col-span-2">
						<h2 className="text-2xl font-bold text-teal-600">MainAI</h2>
						<p className="mt-4 text-gray-500">
							Empowering education through AI-driven solutions. Making
							assignment evaluation smarter, faster, and more consistent.
						</p>
					</div>
					<div>
						<h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
							Navigation
						</h3>
						<ul className="mt-4 space-y-4">
							<li>
								<a
									href="/dashboard"
									className="text-base text-gray-500 transition-colors hover:text-teal-600"
								>
									Dashboard
								</a>
							</li>
							<li>
								<a
									href="/classroom"
									className="text-base text-gray-500 transition-colors hover:text-teal-600"
								>
									Classroom
								</a>
							</li>
							<li>
								<a
									href="/about"
									className="text-base text-gray-500 transition-colors hover:text-teal-600"
								>
									About Us
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
							Connect
						</h3>
						<ul className="mt-4 space-y-4">
							<li>
								<a
									href="#"
									className="text-base text-gray-500 transition-colors hover:text-teal-600"
								>
									Twitter
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-base text-gray-500 transition-colors hover:text-teal-600"
								>
									LinkedIn
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-base text-gray-500 transition-colors hover:text-teal-600"
								>
									GitHub
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="pt-8 mt-8 border-t border-gray-200">
					<p className="text-base text-center text-gray-400">
						© {new Date().getFullYear()} MainAI. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}