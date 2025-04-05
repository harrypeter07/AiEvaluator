"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
	const { data: session } = useSession();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<nav className="fixed top-0 right-0 left-0 z-50 shadow-lg bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-600">
			<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex flex-shrink-0 items-center">
						<Link href="/" className="flex items-center space-x-2 group">
							<Image
								src="/logo3.png"
								alt="AiEvaluator Logo"
								width={40}
								height={40}
								className="rounded-full transition-all duration-300 group-hover:scale-110 shadow-lg"
							/>
							<span className="text-xl md:text-2xl font-bold text-white transition-all duration-300 group-hover:text-blue-200">
								AiEvaluator
							</span>
						</Link>
					</div>
					<div className="hidden sm:flex sm:items-center sm:space-x-8">
						<Link
							href="/dashboard"
							className="inline-flex items-center px-3 py-1 text-sm font-medium text-white transition-all duration-300 border-b-2 border-transparent hover:border-blue-300 hover:text-blue-200 rounded-lg hover:bg-white/10"
						>
							Dashboard
						</Link>
						<Link
							href="/classroom"
							className="inline-flex items-center px-3 py-1 text-sm font-medium text-white transition-all duration-300 border-b-2 border-transparent hover:border-blue-300 hover:text-blue-200 rounded-lg hover:bg-white/10"
						>
							Classroom
						</Link>
						<Link
							href="/about"
							className="inline-flex items-center px-3 py-1 text-sm font-medium text-white transition-all duration-300 border-b-2 border-transparent hover:border-blue-300 hover:text-blue-200 rounded-lg hover:bg-white/10"
						>
							About Us
						</Link>
						{session?.user && (
							<div className="flex items-center px-3 py-1 text-sm font-medium text-white bg-white/10 rounded-lg">
								<svg
									className="mr-2 w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<span>{session.user.name || session.user.email}</span>
							</div>
						)}
					</div>
					<div className="flex items-center -mr-2 sm:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex justify-center items-center p-2 text-white rounded-md hover:text-blue-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300 transition-all duration-300"
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
			<div
				className={`${
					isMenuOpen ? "block" : "hidden"
				} sm:hidden bg-gradient-to-b from-cyan-600 to-cyan-700`}
			>
				<div className="pt-2 pb-3 space-y-1">
					<Link
						href="/dashboard"
						className="block py-2 pr-4 pl-3 text-base font-medium text-white hover:text-blue-200 hover:bg-white/10 transition-all duration-300"
						onClick={() => setIsMenuOpen(false)}
					>
						Dashboard
					</Link>
					<Link
						href="/classroom"
						className="block py-2 pr-4 pl-3 text-base font-medium text-white hover:text-blue-200 hover:bg-white/10 transition-all duration-300"
						onClick={() => setIsMenuOpen(false)}
					>
						Classroom
					</Link>
					<Link
						href="/about"
						className="block py-2 pr-4 pl-3 text-base font-medium text-white hover:text-blue-200 hover:bg-white/10 transition-all duration-300"
						onClick={() => setIsMenuOpen(false)}
					>
						About Us
					</Link>
					{session?.user && (
						<div className="py-2 pr-4 pl-3 text-base font-medium text-white">
							<div className="flex items-center">
								<svg
									className="mr-2 w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<span>{session.user.name || session.user.email}</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
