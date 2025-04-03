"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import FileHandler from "@/components/FileHandler";
import ComparisonResult from "@/components/ComparisonResult";

const ComparePDFsPageBase = () => {
	const { data: session, status } = useSession();
	const [result, setResult] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}
	}, [status, router]);

	const handleResult = (resultData) => {
		if (resultData.error) {
			setError(resultData.error);
			setResult(null);
		} else {
			setError("");
			setResult(resultData);
		}
	};

	if (status === "loading" || isSubmitting) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<div className="text-xl text-gray-600">
						{isSubmitting ? "Comparing PDFs..." : "Loading..."}
					</div>
					{isSubmitting && (
						<p className="text-sm text-gray-500 mt-2">
							This may take a few moments depending on the file sizes
						</p>
					)}
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
					<h1 className="text-2xl font-bold">Compare PDFs</h1>
					<p className="text-gray-600 mt-1">
						Upload two PDF files to analyze similarities and differences
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
					<h2 className="text-lg font-semibold mb-2">Upload PDFs</h2>
					<p className="text-gray-600">
						Select two PDF files to compare their content and check for
						similarities
					</p>
				</div>

				<FileHandler
					mode="compare"
					onResult={handleResult}
					onLoadingChange={setIsSubmitting}
				/>

				{error && (
					<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
						<p className="text-red-600">{error}</p>
					</div>
				)}
			</div>

			{result && !error && <ComparisonResult response={result} />}
		</div>
	);
};

// Wrap with dynamic to prevent SSR issues
const ComparePDFsPage = dynamic(() => Promise.resolve(ComparePDFsPageBase), {
	ssr: false,
});

export default ComparePDFsPage;
