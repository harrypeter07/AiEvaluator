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
        if (session) fetchAssignments();
    }, [session]);

    const fetchAssignments = async () => {
        if (!session) return;
        try {
            const response = await fetch("/api/assignments/count");
            const data = await response.json();
            if (response.ok) setAssignmentCount(data.count);
        } catch (error) {
            console.error("Failed to fetch assignments count", error);
        }
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles(selectedFiles);
        setTitles(selectedFiles.map(file => file.name.replace(/\.[^/.]+$/, "")));
    };

    const handleTitleChange = (index, value) => {
        const newTitles = [...titles];
        newTitles[index] = value;
        setTitles(newTitles);
    };

    const handleUploadSingle = async () => {
        if (!files.length || !session?.user?.id) {
            alert("Please select files and ensure you're signed in.");
            return;
        }

        setLoading(true);
        setResults({});
        setBatchResults(null);

        for (const [index, file] of files.entries()) {
            const formData = new FormData();
            formData.append("pdf", file);
            formData.append("title", titles[index]);
            formData.append("userId", session.user.id);

            try {
                const response = await fetch("/api/assignments/analyze", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                if (response.ok) {
                    setResults(prev => ({
                        ...prev,
                        [file.name]: {
                            plagiarismScore: data.plagiarismScore,
                            similarityMatches: data.similarityMatches,
                            feedback: data.feedback
                        }
                    }));
                }
            } catch (error) {
                setResults(prev => ({
                    ...prev,
                    [file.name]: { error: "Analysis failed" }
                }));
            }
        }
        setLoading(false);
    };

    const handleBatchUpload = async () => {
        if (!files.length || !session?.user?.id) {
            alert("Please select files and ensure you're signed in.");
            return;
        }

        setLoading(true);
        setResults({});
        setBatchResults(null);

        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append("pdfs", file);
            formData.append("titles", titles[index]);
        });
        formData.append("userId", session.user.id);

        try {
            const response = await fetch("/api/assignments/batch-analyze", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            if (response.ok) setBatchResults(data);
        } catch (error) {
            console.error("Batch upload failed", error);
        }
        setLoading(false);
    };

    if (status === "loading") return <p>Loading...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Assignment Checker Dashboard</h1>

            {!session ? (
                <button onClick={() => signIn()} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Sign In
                </button>
            ) : (
                <>
                    <div className="mb-6">
                        <p>Welcome, <strong>{session.user.email}</strong></p>
                        <p>Total Assignments: <strong>{assignmentCount}</strong></p>
                        <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded mt-2">
                            Sign Out
                        </button>
                        <div className="mt-4">
                            <button onClick={() => setBatchMode(false)} className={`px-4 py-2 rounded ${!batchMode ? "bg-blue-500 text-white" : "bg-gray-200"} mr-2`}>
                                Individual Analysis
                            </button>
                            <button onClick={() => setBatchMode(true)} className={`px-4 py-2 rounded ${batchMode ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                                Batch Analysis
                            </button>
                        </div>
                    </div>

                    <div className="mb-6 p-4 border rounded bg-gray-50">
                        <h2 className="font-semibold mb-4">Upload Assignments</h2>
                        <input type="file" accept="application/pdf" multiple onChange={handleFileChange} className="mb-4 w-full" />
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <span className="mr-2">{file.name}</span>
                                <input
                                    type="text"
                                    value={titles[index]}
                                    onChange={(e) => handleTitleChange(index, e.target.value)}
                                    className="border p-1 rounded flex-grow"
                                />
                            </div>
                        ))}
                        <button
                            onClick={batchMode ? handleBatchUpload : handleUploadSingle}
                            disabled={loading || !files.length}
                            className={`px-4 py-2 rounded ${loading ? "bg-gray-400" : "bg-blue-500"} text-white`}
                        >
                            {loading ? "Processing..." : batchMode ? "Process Batch" : "Analyze"}
                        </button>
                    </div>

                    {/* Individual Results */}
                    {!batchMode && Object.entries(results).length > 0 && (
                        <div className="mt-6">
                            <h2 className="font-semibold mb-4">Analysis Results</h2>
                            {Object.entries(results).map(([fileName, result]) => (
                                <div key={fileName} className="mt-4 p-4 border rounded bg-gray-50">
                                    <h3 className="font-semibold">{fileName}</h3>
                                    {result.error ? (
                                        <p className="text-red-500">{result.error}</p>
                                    ) : (
                                        <pre className="whitespace-pre-wrap">{result.feedback}</pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Batch Results */}
                    {batchMode && batchResults && (
                        <div className="mt-6 p-4 border rounded bg-gray-50">
                            <h2 className="font-semibold mb-4">Batch Analysis Results</h2>
                            <p className="mb-4">Overall Plagiarism Risk: {batchResults.results.reduce((sum, r) => sum + r.plagiarismScore, 0) / batchResults.results.length}%</p>
                            {batchResults.results.map((result, index) => (
                                <div key={index} className="mb-4 p-3 bg-white rounded">
                                    <h3 className="font-semibold">{result.title}</h3>
                                    <p>Plagiarism Score: <span className={result.plagiarismScore > 30 ? "text-red-500" : "text-green-500"}>{result.plagiarismScore}%</span></p>
                                    <p>Similar Documents: {result.similarityMatches.length} matches</p>
                                    <pre className="whitespace-pre-wrap mt-2">{result.feedback}</pre>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}