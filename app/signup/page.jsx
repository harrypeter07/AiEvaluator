"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
	const [form, setForm] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const router = useRouter();

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (form.password !== form.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}
		const res = await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: form.username,
				email: form.email,
				password: form.password,
			}),
		});
		if (res.ok) router.push("/login");
	};

	return (
		<div className="flex h-screen">
			{/* Left Side */}
			<div className="w-1/2 flex items-center justify-center bg-gray-100">
				<div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
					<h2 className="text-2xl font-semibold text-center">
						Create an account
					</h2>
					<p className="text-center text-gray-500 mb-6">
						Sign up to get started with the AI PDF evaluator
					</p>
					<form onSubmit={handleSubmit} className="space-y-4">
						<input
							name="username"
							type="text"
							placeholder="Username"
							onChange={handleChange}
							className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
							required
						/>
						<input
							name="email"
							type="email"
							placeholder="Email"
							onChange={handleChange}
							className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
							required
						/>
						<input
							name="password"
							type="password"
							placeholder="Password"
							onChange={handleChange}
							className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
							required
						/>
						<input
							name="confirmPassword"
							type="password"
							placeholder="Confirm Password"
							onChange={handleChange}
							className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
							required
						/>
						<button
							type="submit"
							className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
						>
							Create Account →
						</button>
					</form>
					<div className="text-center mt-4 text-gray-500">OR CONTINUE WITH</div>
					<button className="w-full mt-2 flex items-center justify-center border py-2 rounded-lg hover:bg-gray-200">
						<img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
						Sign up with Google
					</button>
					<p className="text-center mt-4 text-gray-600">
						Already have an account?{" "}
						<a href="/login" className="text-blue-600">
							Sign in
						</a>
					</p>
				</div>
			</div>
			{/* Right Side */}
			<div className="w-1/2 flex flex-col items-center justify-center bg-blue-600 text-white">
				<h2 className="text-3xl font-bold mb-4">AI PDF Evaluator</h2>
				<p className="text-center max-w-md mb-6">
					Join our platform and start evaluating your documents
				</p>
				<div className="space-y-4">
					<div className="bg-white bg-opacity-20 p-4 rounded-lg">
						<p className="font-semibold">Document Repository</p>
						<p className="text-sm">
							Store and organize all your important documents
						</p>
					</div>
					<div className="bg-white bg-opacity-20 p-4 rounded-lg">
						<p className="font-semibold">Team Collaboration</p>
						<p className="text-sm">
							Share and collaborate with your team members
						</p>
					</div>
					<div className="bg-white bg-opacity-20 p-4 rounded-lg">
						<p className="font-semibold">Activity Tracking</p>
						<p className="text-sm">
							Track changes and updates to your documents
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
