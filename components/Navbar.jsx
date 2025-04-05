"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
	const { data: session } = useSession();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<nav className="fixed top-0 right-0 left-0 z-50 shadow-lg backdrop-blur-md bg-white/75">
			<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex flex-shrink-0 items-center">
						<Link href="/" className="text-2xl font-bold text-teal-600">
							AiEvaluator
						</Link>
					</div>
					<div className="hidden sm:flex sm:items-center sm:space-x-8">
						<Link
							href="/dashboard"
							className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 transition-colors hover:text-teal-600"
						>
							Dashboard
						</Link>
						<Link
							href="/classroom"
							className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 transition-colors hover:text-teal-600"
						>
							Classroom
						</Link>
						<Link
							href="/about"
							className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 transition-colors hover:text-teal-600"
						>
							About Us
						</Link>
					</div>
					<div className="flex items-center -mr-2 sm:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex justify-center items-center p-2 text-gray-400 rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
						>
							<span className="sr-only">Open main menu</span>
							{!isMenuOpen ? (
								<svg
									className="block w-6 h-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							) : (
								<svg
									className="block w-6 h-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden`}>
				<div className="pt-2 pb-3 space-y-1">
					<Link
						href="/dashboard"
						className="block py-2 pr-4 pl-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
						onClick={() => setIsMenuOpen(false)}
					>
						Dashboard
					</Link>
					<Link
						href="/classroom"
						className="block py-2 pr-4 pl-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
						onClick={() => setIsMenuOpen(false)}
					>
						Classroom
					</Link>
					<Link
						href="/about"
						className="block py-2 pr-4 pl-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
						onClick={() => setIsMenuOpen(false)}
					>
						About Us
					</Link>
				</div>
			</div>
		</nav>
	);
}