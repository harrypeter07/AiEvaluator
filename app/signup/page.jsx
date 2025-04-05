"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupForm() {
	const [form, setForm] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleChange = (e) => {
		setError("");
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const validateForm = () => {
		if (form.password !== form.confirmPassword) {
			setError("Passwords do not match!");
			return false;
		}
		if (form.password.length < 6) {
			setError("Password must be at least 6 characters long");
			return false;
		}
		if (form.username.length < 3) {
			setError("Username must be at least 3 characters long");
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(form.email)) {
			setError("Please enter a valid email address");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: form.username,
					email: form.email,
					password: form.password,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to sign up");
			}

			// After successful signup, automatically sign in
			const signInResult = await signIn("credentials", {
				email: form.email,
				password: form.password,
				redirect: false,
			});

			if (signInResult?.error) {
				throw new Error("Failed to sign in after registration");
			}

			// Redirect to dashboard after successful signup and signin
			router.push("/dashboard");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-screen">
			{/* Left Side */}
			<div className="flex items-center justify-center w-1/2 bg-gray-50">
				<div className="w-full max-w-md p-8 space-y-6">
					<div className="space-y-2 text-center">
						<h2 className="text-3xl font-bold text-gray-900">
							Create an account
						</h2>
						<p className="text-gray-500">
							Sign up with Google for accessing classroom features
						</p>
					</div>

					{error && (
						<div className="flex items-center px-4 py-3 text-red-600 border border-red-200 rounded-lg bg-red-50">
							<svg
								className="w-5 h-5 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							{error}
						</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Username
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<svg
										className="w-5 h-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
								<input
									name="username"
									type="text"
									required
									className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter your username"
									onChange={handleChange}
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Email address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<svg
										className="w-5 h-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
										/>
									</svg>
								</div>
								<input
									name="email"
									type="email"
									required
									className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									placeholder="Enter your email"
									onChange={handleChange}
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<svg
										className="w-5 h-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
								</div>
								<input
									name="password"
									type="password"
									required
									className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									placeholder="Create a password"
									onChange={handleChange}
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								Confirm Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<svg
										className="w-5 h-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
								</div>
								<input
									name="confirmPassword"
									type="password"
									required
									className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									placeholder="Confirm your password"
									onChange={handleChange}
									disabled={loading}
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
								loading ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{loading ? (
								<>
									<svg
										className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Creating account...
								</>
							) : (
								"Create Account"
							)}
						</button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 text-gray-500 bg-gray-50">
									Or continue with
								</span>
							</div>
						</div>

						<button
							type="button"
							onClick={() => signIn("google", { callbackUrl: "/classroom" })}
							className="flex items-center justify-center w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							disabled={loading}
						>
							<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Sign up with Google
						</button>
					</form>

					<p className="text-sm text-center text-gray-600">
						Already have an account?{" "}
						<a
							href="/login"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Sign in
						</a>
					</p>
				</div>
			</div>

			{/* Right Side */}
			<div className="flex-col items-center justify-center hidden w-1/2 px-12 text-white bg-blue-600 lg:flex">
				<div className="max-w-md text-center">
					<h2 className="mb-6 text-3xl font-bold">AI PDF Evaluator</h2>
					<p className="mb-12 text-xl">
						Join our platform and start evaluating your documents with advanced
						AI technology
					</p>

					<div className="space-y-8">
						<div className="flex items-center p-4 space-x-4 bg-blue-500 rounded-lg bg-opacity-40">
							<svg
								className="w-8 h-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<div className="flex-1">
								<h3 className="font-semibold">Smart Analysis</h3>
								<p className="text-sm opacity-90">
									Advanced document analysis powered by AI
								</p>
							</div>
						</div>

						<div className="flex items-center p-4 space-x-4 bg-blue-500 rounded-lg bg-opacity-40">
							<svg
								className="w-8 h-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
								/>
							</svg>
							<div className="flex-1">
								<h3 className="font-semibold">Batch Processing</h3>
								<p className="text-sm opacity-90">
									Process multiple documents simultaneously
								</p>
							</div>
						</div>

						<div className="flex items-center p-4 space-x-4 bg-blue-500 rounded-lg bg-opacity-40">
							<svg
								className="w-8 h-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							<div className="flex-1">
								<h3 className="font-semibold">Plagiarism Detection</h3>
								<p className="text-sm opacity-90">
									Compare documents for similarities
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
