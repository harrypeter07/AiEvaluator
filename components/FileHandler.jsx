"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const FilePreviewBase = ({ file, previewUrl }) => {
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
						href={previewUrl}
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

const FilePreview = dynamic(() => Promise.resolve(FilePreviewBase), {
	ssr: false,
});

const FileHandlerBase = ({ mode, onResult }) => {
	const [files, setFiles] = useState([]);
	const [compareFile1, setCompareFile1] = useState(null);
	const [compareFile2, setCompareFile2] = useState(null);
	const [loading, setLoading] = useState(false);
	const [previewUrls, setPreviewUrls] = useState({});
	const [error, setError] = useState("");

	useEffect(() => {
		// Cleanup preview URLs when component unmounts
		return () => {
			Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
		};
	}, [previewUrls]);

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

		const formData = new FormData();
		if (mode === "single") {
			formData.append("pdf", files[0]);
			const response = await fetch("/api/assignments/analyze", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();
			if (response.ok) {
				onResult(data.feedback);
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
				onResult(data.result);
			} else {
				alert("Error: " + data.error);
			}
		}

		setLoading(false);
	};

	return (
		<div className="mb-6">
			{mode === "single" && (
				<div className="mb-4">
					<input
						type="file"
						accept="application/pdf"
						onChange={handleFileChange}
						className="mb-4"
					/>
					{files[0] && (
						<FilePreview
							file={files[0]}
							previewUrl={previewUrls[files[0].name]}
						/>
					)}
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
							<FilePreview
								key={index}
								file={file}
								previewUrl={previewUrls[file.name]}
							/>
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
						<input
							type="file"
							accept="application/pdf"
							name="file2"
							onChange={handleFileChange}
							className="mt-1"
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
	);
};

const FileHandler = dynamic(() => Promise.resolve(FileHandlerBase), {
	ssr: false,
});

export default FileHandler;
