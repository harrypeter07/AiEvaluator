"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import FileHandler from "@/components/FileHandler";
import ResultPreview from "@/components/ResultPreview";

const SingleAnalysisPageBase = () => {
	const { data: session, status } = useSession();
	const [result, setResult] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}
	}, [status, router]);

	if (status === "loading" || isSubmitting) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<div className="text-xl text-gray-600">
						{isSubmitting ? "Analyzing PDF..." : "Loading..."}
					</div>
				</div>
			</div>
		);
	}

	if (!session?.user) {
		return null;
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold">Single PDF Analysis</h1>
					<p className="text-gray-600 mt-1">
						Upload a PDF file to get detailed feedback and analysis
					</p>
				</div>
				<Link
					href="/dashboard"
					className="text-blue-500 hover:text-blue-700 transition-colors"
				>
					&larr; Back to Dashboard
				</Link>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="mb-4">
					<h2 className="text-lg font-semibold mb-2">Upload PDF</h2>
					<p className="text-gray-600">
						Select a PDF file to analyze its content and get detailed feedback
					</p>
				</div>

				<FileHandler
					mode="single"
					onResult={setResult}
					onLoadingChange={setIsSubmitting}
				/>
			</div>

			{result && (
				<div className="mt-8 bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
					<ResultPreview response={result} />
				</div>
			)}
		</div>
	);
};

// Wrap with dynamic to prevent SSR issues
const SingleAnalysisPage = dynamic(
	() => Promise.resolve(SingleAnalysisPageBase),
	{
		ssr: false,
	}
);

export default SingleAnalysisPage;
