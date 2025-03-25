"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
	const [form, setForm] = useState({ email: "", password: "" });
	const router = useRouter();

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		const res = await signIn("credentials", {
			email: form.email,
			password: form.password,
			redirect: false,
		});
		if (res.ok) router.push("/dashboard");
	};

	return (
		<div className="flex h-screen">
			{/* Left Side */}
			<div className="w-1/2 flex items-center justify-center bg-gray-100">
				<div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
					<h2 className="text-2xl font-semibold text-center">Welcome back</h2>
					<p className="text-center text-gray-500 mb-6">
						Sign in to continue to the AI PDF evaluator
					</p>
					<form onSubmit={handleSubmit} className="space-y-4">
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
						<button
							type="submit"
							className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
						>
							Sign In →
						</button>
					</form>
					<div className="text-center mt-4 text-gray-500">OR CONTINUE WITH</div>
					<button className="w-full mt-2 flex items-center justify-center border py-2 rounded-lg hover:bg-gray-200">
						<img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
						Sign in with Google
					</button>
					<p className="text-center mt-4 text-gray-600">
						Don't have an account?{" "}
						<a href="/signup" className="text-blue-600">
							Sign up
						</a>
					</p>
				</div>
			</div>
			{/* Right Side */}
			<div className="w-1/2 flex flex-col items-center justify-center bg-blue-600 text-white">
				<h2 className="text-3xl font-bold mb-4">AI PDF Evaluator</h2>
				<p className="text-center max-w-md mb-6">
					Your intelligent document analysis platform
				</p>
				<div className="space-y-4">
					<div className="bg-white bg-opacity-20 p-4 rounded-lg">
						<p className="font-semibold">Smart Analysis</p>
						<p className="text-sm">Get instant feedback on your documents</p>
					</div>
					<div className="bg-white bg-opacity-20 p-4 rounded-lg">
						<p className="font-semibold">Batch Processing</p>
						<p className="text-sm">Process multiple documents at once</p>
					</div>
					<div className="bg-white bg-opacity-20 p-4 rounded-lg">
						<p className="font-semibold">Similarity Detection</p>
						<p className="text-sm">Compare documents for similarities</p>
					</div>
				</div>
			</div>
		</div>
	);
}
