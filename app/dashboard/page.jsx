"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ResultPreview from "@/components/ResultPreview";

const DashboardBase = () => {
	const { data: session, status } = useSession();
	const [files, setFiles] = useState([]);
	const [compareFile1, setCompareFile1] = useState(null);
	const [compareFile2, setCompareFile2] = useState(null);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState("");
	const [assignmentCount, setAssignmentCount] = useState(0);
	const [mode, setMode] = useState("single"); // "single", "batch", or "compare"
	const [previewUrls, setPreviewUrls] = useState({});
	const [error, setError] = useState("");
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

	useEffect(() => {
		// Cleanup preview URLs when component unmounts
		return () => {
			Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
		};
	}, [previewUrls]);

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

	const createPreviewUrl = (file) => {
		const url = URL.createObjectURL(file);
		setPreviewUrls((prev) => ({ ...prev, [file.name]: url }));
		return url;
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		const validTypes = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/jpg",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		const maxSize = 10 * 1024 * 1024; // 10MB

		const validFiles = files.filter((file) => {
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
			setFiles(validFiles);
			setError("");
			// Create preview URLs for valid files
			validFiles.forEach((file) => {
				createPreviewUrl(file);
			});
		}
	};

	const FilePreview = ({ file }) => {
		if (!file) return null;

		return (
			<div className="mt-2 p-4 border rounded-lg bg-white shadow-sm">
				<div className="flex items-center">
					<div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded">
						<svg
							className="w-6 h-6 text-red-500"
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
						<p className="text-sm font-medium text-gray-900">{file.name}</p>
						<p className="text-xs text-gray-500">
							{(file.size / 1024).toFixed(2)} KB
						</p>
					</div>
					<div className="ml-auto">
						<a
							href={previewUrls[file.name]}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-blue-600 hover:text-blue-800"
						>
							Preview
						</a>
					</div>
				</div>
			</div>
		);
	};

	const handleUpload = async () => {
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
		setResult("");

		const formData = new FormData();
		if (mode === "single") {
			formData.append("pdf", files[0]);
			const response = await fetch("/api/assignments/analyze", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();
			if (response.ok) {
				setResult(data.feedback);
				await updateAssignmentCount(files[0].name);
			} else {
				alert("Error: " + data.error);
			}
		} else {
			formData.append("mode", mode);
			if (mode === "batch") {
				files.forEach((file) => {
					formData.append("files", file);
				});
			} else {
				formData.append("file1", compareFile1);
				formData.append("file2", compareFile2);
			}

			const response = await fetch("/api/assignments/batch", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();
			if (response.ok) {
				setResult(data.result);
				if (mode === "batch") {
					for (const file of files) {
						await updateAssignmentCount(file.name);
					}
				}
			} else {
				alert("Error: " + data.error);
			}
		}

		setLoading(false);
	};

	const updateAssignmentCount = async (fileName) => {
		try {
			await fetch("/api/assignments/updateCount", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					assignmentName: fileName,
					mode: mode,
				}),
			});
			await fetchAssignments();
		} catch (error) {
			console.error("Error updating assignment count:", error);
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

			<div className="mb-6">
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

				{mode === "single" && (
					<div className="mb-4">
						<input
							type="file"
							accept="application/pdf"
							onChange={handleFileChange}
							className="mb-4"
						/>
						{files[0] && <FilePreview file={files[0]} />}
					</div>
				)}

				{mode === "batch" && (
					<div className="mb-4">
						<input
							type="file"
							accept="application/pdf"
							multiple
							onChange={handleFileChange}
							className="mb-4"
						/>
						<div className="space-y-2">
							{files.map((file, index) => (
								<FilePreview key={index} file={file} />
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
							<input
								type="file"
								accept="application/pdf"
								name="file1"
								onChange={handleFileChange}
								className="mt-1"
							/>
							{compareFile1 && <FilePreview file={compareFile1} />}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Second PDF
							</label>
							<input
								type="file"
								accept="application/pdf"
								name="file2"
								onChange={handleFileChange}
								className="mt-1"
							/>
							{compareFile2 && <FilePreview file={compareFile2} />}
						</div>
					</div>
				)}

				<button
					onClick={handleUpload}
					disabled={loading}
					className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${
						loading ? "opacity-50 cursor-not-allowed" : ""
					}`}
				>
					{loading ? "Processing..." : "Analyze"}
				</button>
			</div>

			{result && <ResultPreview response={result} />}

			{/* File Upload Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
					<div className="text-sm text-gray-500">
						Supported formats: PDF, Word, Images (max 10MB)
					</div>
				</div>
				<div className="flex items-center justify-center w-full">
					<label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
						<div className="flex flex-col items-center justify-center pt-5 pb-6">
							<svg
								className="w-8 h-8 mb-2 text-gray-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
							<p className="mb-2 text-sm text-gray-500">
								<span className="font-semibold">Click to upload</span> or drag
								and drop
							</p>
							<p className="text-xs text-gray-500">
								PDF, Word, or Images (max 10MB)
							</p>
						</div>
						<input
							type="file"
							className="hidden"
							multiple
							accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
							onChange={handleFileChange}
							disabled={loading}
						/>
					</label>
				</div>
			</div>

			{/* File Preview Section */}
			{files.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-medium text-gray-900">Selected Files</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{files.map((file, index) => (
							<div
								key={index}
								className="flex items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
							>
								<div className="flex-shrink-0">
									{file.type.startsWith("image/") ? (
										<svg
											className="w-8 h-8 text-blue-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									) : file.type === "application/pdf" ? (
										<svg
											className="w-8 h-8 text-red-500"
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
									) : (
										<svg
											className="w-8 h-8 text-blue-500"
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
									)}
								</div>
								<div className="ml-4 flex-1">
									<p className="text-sm font-medium text-gray-900 truncate">
										{file.name}
									</p>
									<p className="text-xs text-gray-500">
										{(file.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								<div className="ml-4">
									<button
										type="button"
										onClick={() =>
											window.open(previewUrls[file.name], "_blank")
										}
										className="text-blue-600 hover:text-blue-800"
									>
										Preview
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

// Wrap the component with dynamic import to disable SSR
const Dashboard = dynamic(() => Promise.resolve(DashboardBase), {
	ssr: false,
});

export default Dashboard;
