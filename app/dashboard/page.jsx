"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const DashboardBase = () => {
	const { data: session, status } = useSession();
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
		<div className="max-w-6xl mx-auto p-6">
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

			<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
				<Link href="/dashboard/single" className="block">
					<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
						<h2 className="text-xl font-semibold mb-4">Single Analysis</h2>
						<p className="text-gray-600 mb-4">
							Upload and analyze a single PDF file to get detailed feedback on
							the content.
						</p>
						<div className="flex justify-end">
							<div className="bg-blue-500 text-white px-4 py-2 rounded">
								Go to Single Analysis
							</div>
						</div>
					</div>
				</Link>

				<Link href="/dashboard/compare" className="block">
					<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
						<h2 className="text-xl font-semibold mb-4">Compare PDFs</h2>
						<p className="text-gray-600 mb-4">
							Upload two PDF files to compare them and check for similarities or
							plagiarism.
						</p>
						<div className="flex justify-end">
							<div className="bg-blue-500 text-white px-4 py-2 rounded">
								Go to Compare PDFs
							</div>
						</div>
					</div>
				</Link>
			</div>
		</div>
	);
};

// Wrap with dynamic to prevent SSR issues
const Dashboard = dynamic(() => Promise.resolve(DashboardBase), {
	ssr: false,
});

export default Dashboard;
