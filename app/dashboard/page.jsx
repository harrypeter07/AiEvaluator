"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
	const { data: session, status } = useSession();
	const [files, setFiles] = useState([]);
	const [compareFile1, setCompareFile1] = useState(null);
	const [compareFile2, setCompareFile2] = useState(null);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState("");
	const [assignmentCount, setAssignmentCount] = useState(0);
	const [mode, setMode] = useState("single"); // "single", "batch", or "compare"

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

	const handleFileChange = (event, mode) => {
		if (mode === "single") {
			setFiles([event.target.files[0]]);
		} else if (mode === "batch") {
			setFiles(Array.from(event.target.files));
		} else if (mode === "compare") {
			if (event.target.name === "file1") {
				setCompareFile1(event.target.files[0]);
			} else {
				setCompareFile2(event.target.files[0]);
			}
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
					<div className="mb-4">
						<p>
							Welcome, <strong>{session.user.email}</strong>
						</p>
						<p>
							Total Assignments: <strong>{assignmentCount}</strong>
						</p>
						<button
							onClick={() => signOut()}
							className="bg-red-500 text-white px-4 py-2 rounded mt-2"
						>
							Sign Out
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
									onChange={(e) => handleFileChange(e, "single")}
									className="mb-4"
								/>
							</div>
						)}

						{mode === "batch" && (
							<div className="mb-4">
								<input
									type="file"
									accept="application/pdf"
									multiple
									onChange={(e) => handleFileChange(e, "batch")}
									className="mb-4"
								/>
								{files.length > 0 && (
									<p className="text-sm text-gray-600">
										Selected {files.length} file(s)
									</p>
								)}
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
										onChange={(e) => handleFileChange(e, "compare")}
										className="mt-1"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Second PDF
									</label>
									<input
										type="file"
										accept="application/pdf"
										name="file2"
										onChange={(e) => handleFileChange(e, "compare")}
										className="mt-1"
									/>
								</div>
							</div>
						)}

						<button
							onClick={handleUpload}
							disabled={loading}
							className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
						>
							{loading ? "Processing..." : "Analyze"}
						</button>
					</div>

					{result && (
						<div className="mt-4 p-4 border rounded bg-gray-100">
							<h2 className="font-semibold mb-2">Analysis Result:</h2>
							<pre className="whitespace-pre-wrap font-sans text-gray-800">
								{result}
							</pre>
						</div>
					)}
				</>
			)}
		</div>
	);
}
