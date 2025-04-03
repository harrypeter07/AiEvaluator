"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResultPreview from "@/components/ResultPreview";
import FileHandler from "@/components/FileHandler";

const DashboardContent = () => {
	const { data: session, status } = useSession();
	const [mode, setMode] = useState("single");
	const [result, setResult] = useState("");
	const [assignmentCount, setAssignmentCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	useEffect(() => {
		if (session?.user?.email) {
			fetchAssignments();
		}
	}, [session?.user?.email]);

	const fetchAssignments = async () => {
		if (!session?.user?.email) return;
		setIsLoading(true);
		try {
			const response = await fetch("/api/assignments/count");
			const data = await response.json();
			if (response.ok) {
				setAssignmentCount(data.count);
			} else {
				console.error("Error fetching assignments count:", data.error);
			}
		} catch (error) {
			console.error("Failed to fetch assignments count", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await signOut({ redirect: false });
			router.push("/login");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<div className="text-xl text-gray-600">Loading dashboard...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold">Assignment Checker Dashboard</h1>
					<p className="text-gray-600">
						Welcome,{" "}
						<span className="font-semibold">{session?.user?.email}</span>
					</p>
					<p className="text-gray-600">
						Total Assignments:{" "}
						<span className="font-semibold">{assignmentCount}</span>
					</p>
				</div>
				<button
					onClick={handleLogout}
					className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
				>
					Logout
				</button>
			</div>

			<div className="flex space-x-4 mb-4">
				<button
					onClick={() => setMode("single")}
					className={`px-4 py-2 rounded ${
						mode === "single" ? "bg-blue-500 text-white" : "bg-gray-200"
					}`}
				>
					Single Analysis
				</button>
				<button
					onClick={() => setMode("batch")}
					className={`px-4 py-2 rounded ${
						mode === "batch" ? "bg-blue-500 text-white" : "bg-gray-200"
					}`}
				>
					Batch Analysis
				</button>
				<button
					onClick={() => setMode("compare")}
					className={`px-4 py-2 rounded ${
						mode === "compare" ? "bg-blue-500 text-white" : "bg-gray-200"
					}`}
				>
					Compare PDFs
				</button>
			</div>

			<FileHandler
				mode={mode}
				onResult={setResult}
				onLoadingChange={setIsSubmitting}
			/>

			{isSubmitting && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-xl text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<div className="text-xl text-gray-600">
							Processing your request...
						</div>
						<div className="text-sm text-gray-500 mt-2">
							This may take a few moments
						</div>
					</div>
				</div>
			)}

			{result && <ResultPreview response={result} />}
		</div>
	);
};

export default DashboardContent;
