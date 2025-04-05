export default function Footer() {
	return (
		<footer className="bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-600 border-t border-cyan-500">
			<div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div className="col-span-1 md:col-span-2">
						<h2 className="text-2xl font-bold text-white">AI Evaluator</h2>
						<p className="mt-4 text-cyan-100">
							Empowering education through AI-driven solutions. Making
							assignment evaluation smarter, faster, and more consistent.
						</p>
					</div>
					<div>
						<h3 className="text-sm font-semibold tracking-wider text-cyan-50 uppercase">
							Navigation
						</h3>
						<ul className="mt-4 space-y-4">
							<li>
								<a
									href="/dashboard"
									className="text-base text-cyan-100 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block"
								>
									Dashboard
								</a>
							</li>
							<li>
								<a
									href="/classroom"
									className="text-base text-cyan-100 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block"
								>
									Classroom
								</a>
							</li>
							<li>
								<a
									href="/about"
									className="text-base text-cyan-100 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block"
								>
									About Us
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-sm font-semibold tracking-wider text-cyan-50 uppercase">
							Connect
						</h3>
						<ul className="mt-4 space-y-4">
							<li>
								<a
									href="#"
									className="text-base text-cyan-100 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block"
								>
									Twitter
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-base text-cyan-100 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block"
								>
									LinkedIn
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-base text-cyan-100 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block"
								>
									GitHub
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="pt-8 mt-8 border-t border-cyan-500">
					<p className="text-base text-center text-cyan-100">
						© {new Date().getFullYear()} AI Evaluator. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
