"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ResultPreview from "@/components/ResultPreview";
import FileHandler from "@/components/FileHandler";

// Wrap ResultPreview with dynamic import
const DynamicResultPreview = dynamic(
	() => import("@/components/ResultPreview"),
	{
		ssr: false,
	}
);

// Wrap FileHandler with dynamic import
const DynamicFileHandler = dynamic(() => import("@/components/FileHandler"), {
	ssr: false,
});

const DashboardContent = () => {
	const { data: session, status } = useSession();
	const [mode, setMode] = useState("single");
	const [result, setResult] = useState("");
	const [assignmentCount, setAssignmentCount] = useState(0);
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	useEffect(() => {
		if (session) {
			fetchAssignments();
		}
	}, [session]);

	const fetchAssignments = async () => {
		if (!session) return;
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

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-xl">Loading...</div>
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

			<DynamicFileHandler mode={mode} onResult={setResult} />

			{result && <DynamicResultPreview response={result} />}
		</div>
	);
};

export default DashboardContent;
