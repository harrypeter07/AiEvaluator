"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [assignmentCount, setAssignmentCount] = useState(0);

    useEffect(() => {
        if (session) {
            fetchAssignments();
        }
    }, [session]);

    const fetchAssignments = async () => {
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
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a PDF file first.");
            return;
        }

        setLoading(true);
        setResult("");

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const response = await fetch("/api/assignments/analyze", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data.feedback);
                fetchAssignments(); // Update count after upload
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to analyze the assignment.");
        }

        setLoading(false);
    };

    if (status === "loading") return <p>Loading...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Assignment Checker Dashboard</h1>

            {!session ? (
                <button onClick={() => signIn()} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Sign In
                </button>
            ) : (
                <>
                    <div className="mb-4">
                        <p>Welcome, <strong>{session.user.email}</strong></p>
                        <p>Total Assignments: <strong>{assignmentCount}</strong></p>
                        <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded mt-2">
                            Sign Out
                        </button>
                    </div>

                    <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />
                    <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
                        {loading ? "Analyzing..." : "Upload & Analyze"}
                    </button>

                    {result && (
                        <div className="mt-4 p-4 border rounded bg-gray-100">
                            <h2 className="font-semibold mb-2">Analysis Result:</h2>
                            <p>{result}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
