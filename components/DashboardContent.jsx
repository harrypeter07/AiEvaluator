"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ResultPreview from "@/components/ResultPreview";
import FileHandler from "@/components/FileHandler";

const DashboardContentBase = () => {
	const { data: session, status } = useSession();
	const [mode, setMode] = useState("single");
	const [result, setResult] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [assignmentCount, setAssignmentCount] = useState(0);
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	useEffect(() => {
		if (status === "authenticated") {
			fetchAssignmentCount();
		}
	}, [status]);

	const fetchAssignmentCount = async () => {
		try {
			const response = await fetch("/api/assignments/count");
			if (!response.ok) throw new Error("Failed to fetch assignment count");
			const data = await response.json();
			setAssignmentCount(data.count);
		} catch (error) {
			console.error("Error fetching assignment count:", error);
		}
	};

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/login" });
	};

	if (status === "loading") {
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

			{result && (
				<div className="mt-8">
					<ResultPreview response={result} />
				</div>
			)}
		</div>
	);
};

const DashboardContent = dynamic(() => Promise.resolve(DashboardContentBase), {
	ssr: false,
});

export default DashboardContent;
