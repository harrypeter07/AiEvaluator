"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import ComparisonResult from "./ComparisonResult";
import ResultPreview from "./ResultPreview";
import { FileUpload } from "@/components/ui/file-upload";

const FilePreviewBase = ({ file, previewUrl }) => {
	if (!file) return null;

	return (
		<div className="p-4 mt-2 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
			<div className="flex items-center">
				<div className="flex justify-center items-center w-10 h-10 bg-gray-100 rounded-lg transition-colors duration-300 hover:bg-gray-200">
					<svg
						className="w-6 h-6 text-gray-500 transition-colors duration-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div className="ml-3">
					<p className="text-sm font-medium text-gray-900 transition-colors duration-300">
						{file.name}
					</p>
					<p className="text-xs text-gray-500 transition-colors duration-300">
						{(file.size / 1024).toFixed(2)} KB
					</p>
				</div>
				<div className="ml-auto">
					<a
						href={previewUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-blue-600 transition-colors duration-300 hover:text-blue-800"
					>
						Preview
					</a>
				</div>
			</div>
		</div>
	);
};

const FilePreview = dynamic(() => Promise.resolve(FilePreviewBase), {
	ssr: false,
});

const FileHandlerBase = ({ mode, onResult, onLoadingChange }) => {
	const { data: session } = useSession();
	const [files, setFiles] = useState([]);
	const [compareFile1, setCompareFile1] = useState(null);
	const [compareFile2, setCompareFile2] = useState(null);
	const [titles, setTitles] = useState([]); // For batch mode titles
	const [title, setTitle] = useState(""); // For single mode title
	const [loading, setLoading] = useState(false);
	const [previewUrls, setPreviewUrls] = useState({});
	const [error, setError] = useState("");
	const [result, setResult] = useState(null);

	useEffect(() => {
		// Cleanup preview URLs when component unmounts
		return () => {
			Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
		};
	}, [previewUrls]);

	const handleFileUpload = (uploadedFiles, uploadType) => {
		const validTypes = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/jpg",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		const maxSize = 10 * 1024 * 1024; // 10MB

		const validFiles = uploadedFiles.filter((file) => {
			if (!validTypes.includes(file.type)) {
				setError(
					`Invalid file type: ${file.name}. Please upload PDF, Word, or image files only.`
				);
				return false;
			}
			if (file.size > maxSize) {
				setError(`File too large: ${file.name}. Maximum size is 10MB.`);
				return false;
			}
			return true;
		});

		if (validFiles.length > 0) {
			if (mode === "compare") {
				if (uploadType === "file1") {
					setCompareFile1(validFiles[0]);
				} else if (uploadType === "file2") {
					setCompareFile2(validFiles[0]);
				}
			} else {
				setFiles(validFiles);
				// Initialize titles array for batch mode
				if (mode === "batch") {
					setTitles(
						validFiles.map((file) => file.name.replace(/\.[^/.]+$/, ""))
					);
				} else if (mode === "single" && validFiles.length > 0) {
					setTitle(validFiles[0].name.replace(/\.[^/.]+$/, ""));
				}
			}
			setError("");
		}
	};

	const handleTitleChange = (index, value) => {
		const newTitles = [...titles];
		newTitles[index] = value;
		setTitles(newTitles);
	};

	const handleSingleTitleChange = (e) => {
		setTitle(e.target.value);
	};

	const handleUpload = async (e) => {
		if (e) {
			e.preventDefault();
		}

		if (!session?.user?.email) {
			alert("Your session has expired. Please sign in again to continue.");
			return;
		}

		if (mode === "single" && files.length === 0) {
			alert("Please select a PDF file first.");
			return;
		}

		if (mode === "batch" && files.length === 0) {
			alert("Please select at least one PDF file.");
			return;
		}

		if (mode === "compare" && (!compareFile1 || !compareFile2)) {
			alert("Please select both PDF files for comparison.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			if (mode === "single") {
				const file = files[0];
				if (!file.type.includes("pdf")) {
					alert("Please upload a PDF file.");
					setLoading(false);
					return;
				}
				const formData = new FormData();
				formData.append("pdf", file);
				formData.append("title", title || file.name.replace(/\.[^/.]+$/, ""));

				const response = await fetch("/api/assignments/analyze", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					if (response.status === 401) {
						alert(
							"Your session has expired. Please sign in again to continue."
						);
						return;
					}
					throw new Error(errorData.error || "Failed to analyze assignment");
				}

				const data = await response.json();
				if (onResult) {
					onResult(data.feedback);
				}
			} else if (mode === "batch") {
				// Validate all files are PDFs
				for (const file of files) {
					if (!file.type.includes("pdf")) {
						alert(
							`File ${file.name} is not a PDF. Please upload only PDF files.`
						);
						return;
					}
				}

				const formData = new FormData();
				// Append all files
				files.forEach((file) => {
					formData.append("pdfs", file);
				});
				// Append all titles
				titles.forEach((title, index) => {
					formData.append(
						"titles",
						title || files[index].name.replace(/\.[^/.]+$/, "")
					);
				});

				const response = await fetch("/api/assignments/batch-analyze", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					if (response.status === 401) {
						alert(
							"Your session has expired. Please sign in again to continue."
						);
						return;
					}
					throw new Error(errorData.error || "Failed to analyze assignments");
				}

				const data = await response.json();
				if (!data.results || !Array.isArray(data.results)) {
					throw new Error("Invalid response format from batch analysis");
				}

				// Display results for each file
				let combinedFeedback = "";
				data.results.forEach((result, index) => {
					combinedFeedback += `=== Analysis for ${files[index].name} ===\n\n`;
					combinedFeedback += result.feedback;
					combinedFeedback += "\n\n";
					if (result.plagiarismScore !== undefined) {
						combinedFeedback += `Plagiarism Score: ${result.plagiarismScore}%\n\n`;
					}
					if (result.similarityMatches && result.similarityMatches.length > 0) {
						combinedFeedback += "Similarity Matches:\n";
						result.similarityMatches.forEach((match) => {
							combinedFeedback += `- ${match.matchedAssignmentId}: ${match.similarityPercentage}%\n`;
						});
						combinedFeedback += "\n";
					}
					combinedFeedback += "=".repeat(50) + "\n\n";
				});

				setResult(combinedFeedback);
				if (onResult) {
					onResult(combinedFeedback);
				}
			} else if (mode === "compare") {
				const formData = new FormData();
				formData.append("file1", compareFile1);
				formData.append("file2", compareFile2);

				const response = await fetch("/api/assignments/compare", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					if (response.status === 401) {
						alert(
							"Your session has expired. Please sign in again to continue."
						);
						return;
					}
					throw new Error(errorData.error || "Failed to compare PDFs");
				}

				const data = await response.json();
				if (data.success) {
					setResult(data.feedback);
					if (onResult) {
						onResult(data);
					}
				} else {
					throw new Error(data.error || "Failed to compare PDFs");
				}
			}
		} catch (error) {
			console.error("Error uploading file:", error);
			setError(error.message || "Error uploading file");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 rounded-lg border border-gray-300 shadow-md transition-all duration-300 hover:shadow-lg">
			{mode === "single" && (
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Upload PDF
						</label>
						<FileUpload onChange={(files) => handleFileUpload(files)} />
						{files.length > 0 && (
							<FilePreview
								file={files[0]}
								previewUrl={previewUrls[files[0].name]}
							/>
						)}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Title
						</label>
						<input
							type="text"
							value={title}
							onChange={handleSingleTitleChange}
							className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							placeholder="Enter assignment title"
						/>
					</div>
				</div>
			)}

			{mode === "batch" && (
				<div className="mb-4">
					<FileUpload onChange={(files) => handleFileUpload(files)} />
					<div className="space-y-4">
						{files.map((file, index) => (
							<div key={index}>
								<div className="mb-2">
									<label className="block mb-1 text-sm font-medium text-gray-700">
										Title for {file.name}
									</label>
									<input
										type="text"
										value={titles[index] || ""}
										onChange={(e) => handleTitleChange(index, e.target.value)}
										className="px-3 py-2 w-full rounded-md border border-gray-300"
										placeholder="Enter assignment title"
									/>
								</div>
								<FilePreview file={file} previewUrl={previewUrls[file.name]} />
							</div>
						))}
					</div>
				</div>
			)}

			{mode === "compare" && (
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							First PDF
						</label>
						<FileUpload
							onChange={(files) => handleFileUpload(files, "file1")}
						/>
						{compareFile1 && (
							<FilePreview
								file={compareFile1}
								previewUrl={previewUrls[compareFile1.name]}
							/>
						)}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Second PDF
						</label>
						<FileUpload
							onChange={(files) => handleFileUpload(files, "file2")}
						/>
						{compareFile2 && (
							<FilePreview
								file={compareFile2}
								previewUrl={previewUrls[compareFile2.name]}
							/>
						)}
					</div>
				</div>
			)}

			{error && <div className="mt-2 text-sm text-red-500">{error}</div>}

			<button
				onClick={handleUpload}
				disabled={loading}
				className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all duration-300 hover:scale-[1.02] border border-blue-600 ${
					loading ? "opacity-50 cursor-not-allowed" : ""
				}`}
			>
				{loading ? "Processing..." : "Analyze"}
			</button>

			{result && (
				<div className="mt-8">
					{mode === "compare" ? (
						// <ComparisonResult response={result} />

						<h1>hello</h1>
					) : (
						<ResultPreview response={result} />
					)}
				</div>
			)}
		</div>
	);
};

const FileHandler = dynamic(() => Promise.resolve(FileHandlerBase), {
	ssr: false,
});

export default FileHandler;
