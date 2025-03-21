"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
	const { data: session, status } = useSession();
	const [files, setFiles] = useState([]);
	const [titles, setTitles] = useState([]);
	const [results, setResults] = useState({});
	const [batchResults, setBatchResults] = useState(null);
	const [assignmentCount, setAssignmentCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [batchMode, setBatchMode] = useState(false);

	useEffect(() => {
		if (session) {
			fetchAssignments();
		}
	}, [session, assignmentCount]);

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

	const handleFileChange = (event) => {
		const selectedFiles = Array.from(event.target.files);
		setFiles(selectedFiles);

		// Generate default titles based on filenames
		const newTitles = selectedFiles.map((file) => {
			return file.name.replace(/\.[^/.]+$/, ""); // Remove extension
		});

		setTitles(newTitles);
	};

	const handleTitleChange = (index, value) => {
		const newTitles = [...titles];
		newTitles[index] = value;
		setTitles(newTitles);
	};

	const handleUploadSingle = async () => {
		if (!files.length) {
			alert("Please select PDF files first.");
			return;
		}

		if (!session?.user?.id) {
			alert("Authentication error. Please sign in again.");
			return;
		}

		setLoading(true);
		setResults({});
		let hasError = false;

		for (const [index, file] of files.entries()) {
			const formData = new FormData();
			formData.append("pdf", file);
			formData.append("title", titles[index] || file.name);

			// Make sure we have a valid user ID from the session
			if (session?.user?.id) {
				formData.append("userId", session.user.id);
			} else {
				console.error("User ID not found in session");
				setResults((prev) => ({
					...prev,
					[file.name]:
						"Error: User authentication issue. Please sign out and sign in again.",
				}));
				continue;
			}

			try {
				const response = await fetch("/api/assignments/analyze", {
					method: "POST",
					body: formData,
				});

				const data = await response.json();

				if (response.ok) {
					setResults((prev) => ({
						...prev,
						[file.name]: {
							feedback: data.feedback || "Analysis complete",
							plagiarismScore: data.plagiarismScore || 0,
							similarityMatches: data.similarityMatches || [],
							title: data.title || titles[index] || file.name,
						},
					}));
					if (data.plagiarismScore > 70) {
						hasError = true;
					}

					await fetch("/api/assignments/updateCount", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ assignmentName: file.name }),
					});

					await fetchAssignments();
				} else {
					setResults((prev) => ({
						...prev,
						[file.name]: { error: data.error || "Failed to analyze" },
					}));
				}
			} catch (error) {
				console.error("Upload failed", error);
				setResults((prev) => ({
					...prev,
					[file.name]: { error: "Failed to analyze the assignment." },
				}));
			}
		}

		setLoading(false);
		if (hasError) {
			alert("Warning: High plagiarism detected in one or more files!");
		}
	};

	const handleBatchUpload = async () => {
		if (!files.length) {
			alert("Please select PDF files first.");
			return;
		}

		setLoading(true);
		setBatchResults(null);
		setResults({});

		const formData = new FormData();

		// Add all files and titles to formData
		files.forEach((file, index) => {
			formData.append("pdfs", file);
			formData.append(
				"titles",
				titles[index] || file.name.replace(/\.[^/.]+$/, "")
			);
		});

		// Add user ID
		if (session?.user?.id) {
			formData.append("userId", session.user.id);
		} else {
			console.error("User ID not found in session");
			setLoading(false);
			if (hasError) {
				alert("Warning: High plagiarism detected in one or more files!");
			}
			alert("Authentication error. Please sign out and sign in again.");
			return;
		}

		try {
			const response = await fetch("/api/assignments/batch-analyze", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				setBatchResults(data);
				await fetchAssignments();
			} else {
				alert(`Error: ${data.error || "Failed to analyze batch"}`);
			}
		} catch (error) {
			console.error("Batch upload failed", error);
			alert("Failed to process the batch of assignments.");
		}

		setLoading(false);
		if (hasError) {
			alert("Warning: High plagiarism detected in one or more files!");
		}
	};

	if (status === "loading") return <p>Loading...</p>;

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Assignment Checker Dashboard</h1>

			{!session ? (
				<button
					onClick={() => signIn()}
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					Sign In
				</button>
			) : (
				<>
					<div className="mb-6">
						<p className="mb-2">
							Welcome, <strong>{session.user.email}</strong>
						</p>
						<p className="mb-4">
							Total Assignments: <strong>{assignmentCount}</strong>
						</p>
						<button
							onClick={() => signOut()}
							className="bg-red-500 text-white px-4 py-2 rounded mr-2"
						>
							Sign Out
						</button>

						<div className="mt-4 mb-6">
							<div className="flex space-x-4 mb-2">
								<button
									onClick={() => setBatchMode(false)}
									className={`px-4 py-2 rounded ${
										!batchMode ? "bg-blue-500 text-white" : "bg-gray-200"
									}`}
								>
									Individual Analysis
								</button>
								<button
									onClick={() => setBatchMode(true)}
									className={`px-4 py-2 rounded ${
										batchMode ? "bg-blue-500 text-white" : "bg-gray-200"
									}`}
								>
									Batch Analysis
								</button>
							</div>
							<p className="text-sm text-gray-600">
								{batchMode
									? "Batch analysis will compare all uploaded documents against each other and previous uploads."
									: "Individual analysis processes each document separately."}
							</p>
						</div>
					</div>

					<div className="mb-6 p-4 border rounded bg-gray-50">
						<h2 className="font-semibold mb-4">Upload Assignments</h2>

						<input
							type="file"
							accept="application/pdf"
							multiple
							onChange={handleFileChange}
							className="mb-4 w-full"
						/>

						{files.length > 0 && (
							<div className="mb-4">
								<h3 className="font-medium mb-2">
									Selected Files ({files.length})
								</h3>
								{files.map((file, index) => (
									<div key={index} className="flex items-center mb-2">
										<span className="mr-2 flex-shrink-0">{file.name}</span>
										<input
											type="text"
											placeholder="Assignment title"
											value={titles[index] || ""}
											onChange={(e) => handleTitleChange(index, e.target.value)}
											className="border p-1 rounded flex-grow"
										/>
									</div>
								))}
							</div>
						)}

						<button
							onClick={batchMode ? handleBatchUpload : handleUploadSingle}
							disabled={loading || files.length === 0}
							className={`px-4 py-2 rounded ${
								loading ? "bg-gray-400" : "bg-blue-500"
							} text-white`}
						>
							{loading
								? "Processing..."
								: batchMode
								? "Process Batch"
								: "Upload & Analyze"}
						</button>
					</div>

					{/* Batch Results Display */}
					{batchResults && (
						<div className="mt-6 p-4 border rounded bg-gray-50">
							<h2 className="font-semibold mb-4">Batch Analysis Results</h2>

							<div className="overflow-x-auto">
								<table className="min-w-full bg-white">
									<thead>
										<tr className="bg-gray-200">
											<th className="py-2 px-4 text-left">Title</th>
											<th className="py-2 px-4 text-left">Plagiarism Score</th>
											<th className="py-2 px-4 text-left">Similar Documents</th>
										</tr>
									</thead>
									<tbody>
										{batchResults.results.map((result, index) => (
											<tr
												key={index}
												className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
											>
												<td className="py-2 px-4">{result.title}</td>
												<td
													className={`py-2 px-4 ${
														result.plagiarismScore > 30
															? "text-red-500"
															: "text-green-500"
													}`}
												>
													{result.plagiarismScore}%
												</td>
												<td className="py-2 px-4">
													{result.similarityMatches?.length || 0} matches
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{/* Individual Results Display */}
					{Object.entries(results).length > 0 && !batchMode && (
						<div className="mt-6">
							<h2 className="font-semibold mb-4">Analysis Results</h2>
							{Object.entries(results).map(([fileName, result]) => (
								<div
									key={fileName}
									className="mt-4 p-4 border rounded bg-gray-50"
								>
									<h3 className="font-semibold mb-2">{fileName}</h3>

									{result.error ? (
										<p className="text-red-500">{result.error}</p>
									) : (
										<>
											<div className="mb-2">
												<span className="font-medium">Plagiarism Score: </span>
												<span
													className={
														result.plagiarismScore > 30
															? "text-red-500"
															: "text-green-500"
													}
												>
													{result.plagiarismScore}%
												</span>
											</div>

											<div className="mb-4">
												<span className="font-medium">Similar Documents: </span>
												{result.similarityMatches?.length || 0} matches
											</div>

											<div className="mt-2 p-3 bg-white rounded">
												<h4 className="font-medium mb-1">Feedback:</h4>
												<p className="whitespace-pre-line">{result.feedback}</p>
											</div>
										</>
									)}
								</div>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
