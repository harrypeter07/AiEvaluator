"use client";

import React, { useEffect, useState, useRef } from "react";
import { Download, AlertTriangle, CheckCircle, Info } from "lucide-react";
import dynamic from "next/dynamic";
// import html2pdf from "html2pdf.js";

const ComparisonResultBase = ({ response }) => {
	const resultRef = useRef(null);
	const [mounted, setMounted] = useState(false);
	const [sections, setSections] = useState(null);
	const [similarityScore, setSimilarityScore] = useState(0);
	const [file1Name, setFile1Name] = useState("");
	const [file2Name, setFile2Name] = useState("");
	console.log(response);
	useEffect(() => {
		setMounted(true);

		if (response) {
			// Handle both direct feedback string and structured response object
			if (typeof response === "string") {
				// If response is just a string
				setSections(parseResponse(response));
				setSimilarityScore(extractSimilarityScore(response));
			} else if (response.feedback) {
				// If response is the structured object from the API
				setSections(parseResponse(response.feedback));
				setSimilarityScore(response.comparison?.similarityScore || 0);
				setFile1Name(response.comparison?.file1Name || "File 1");
				setFile2Name(response.comparison?.file2Name || "File 2");
			}
		}
	}, [response]);

	const extractSimilarityScore = (text) => {
		const match = text.match(/Similarity Score:\s*(\d+)%/);
		return match ? parseInt(match[1]) : 0;
	};

	const parseResponse = (text) => {
		const sections = {};
		const lines = text.split("\n");
		let currentSection = null;

		lines.forEach((line) => {
			if (line.startsWith("Similarity Score:")) {
				sections.similarityScore = parseInt(line.match(/\d+/)?.[0] || "0");
			} else if (line.startsWith("Detailed Analysis:")) {
				currentSection = "detailedAnalysis";
				sections[currentSection] = [];
			} else if (line.startsWith("Similar Sections:")) {
				currentSection = "similarSections";
				sections[currentSection] = [];
			} else if (line.startsWith("Recommendation:")) {
				currentSection = "recommendation";
				sections[currentSection] = [];
			} else if (currentSection && line.trim()) {
				sections[currentSection].push(line.trim());
			}
		});

		return sections;
	};

	const getSimilarityColor = (score) => {
		if (score >= 80) return "text-red-500";
		if (score >= 60) return "text-orange-500";
		if (score >= 40) return "text-yellow-500";
		return "text-green-500";
	};

	const getSimilarityIcon = (score) => {
		if (score >= 80) return <AlertTriangle className="w-6 h-6 text-red-500" />;
		if (score >= 60)
			return <AlertTriangle className="w-6 h-6 text-orange-500" />;
		if (score >= 40) return <Info className="w-6 h-6 text-yellow-500" />;
		return <CheckCircle className="w-6 h-6 text-green-500" />;
	};

	const handleDownload = async () => {
		// const element = resultRef.current;
		// const opt = {
		// 	margin: 1,
		// 	filename: "comparison-analysis.pdf",
		// 	image: { type: "jpeg", quality: 0.98 },
		// 	html2canvas: { scale: 2 },
		// 	jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
		// };
		// await html2pdf().set(opt).from(element).save();
		alert("donwloadddddd");
	};

	if (!mounted || !sections) {
		return null;
	}

	return (
		<div
			ref={resultRef}
			className="p-6 mx-auto max-w-4xl bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border border-gray-300"
		>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-800">
					PDF Comparison Analysis
				</h2>
				<button
					onClick={handleDownload}
					className="flex items-center px-4 py-2 text-white bg-blue-500 rounded border border-blue-600 transition-all duration-300 transform hover:bg-blue-600 hover:scale-105"
				>
					<Download className="mr-2 w-4 h-4" />
					Download Report
				</button>
			</div>

			{/* File Names */}
			<div className="p-4 mb-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md">
				<h3 className="mb-2 text-lg font-semibold text-gray-700">
					Files Compared
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-gray-600">File 1:</p>
						<p className="font-medium text-gray-800">{file1Name}</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">File 2:</p>
						<p className="font-medium text-gray-800">{file2Name}</p>
					</div>
				</div>
			</div>

			{/* Similarity Score Card */}
			<div className="p-6 mb-8 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md">
				<div className="flex justify-between items-center">
					<div className="flex items-center">
						{getSimilarityIcon(similarityScore)}
						<h3 className="ml-3 text-xl font-semibold text-gray-800">
							Similarity Score
						</h3>
					</div>
					<div
						className={`text-4xl font-bold ${getSimilarityColor( similarityScore )}`}
					>
						{similarityScore}%
					</div>
				</div>
			</div>

			{/* Detailed Analysis */}
			<div className="mb-8">
				<h3 className="mb-4 text-xl font-semibold text-gray-800">
					Detailed Analysis
				</h3>
				<div className="p-6 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-300 hover:shadow-md">
					<p className="text-gray-700 whitespace-pre-line">
						{sections.detailedAnalysis?.join("\n")}
					</p>
				</div>
			</div>

			{/* Similar Sections */}
			{sections.similarSections && sections.similarSections.length > 0 && (
				<div className="mb-8">
					<h3 className="mb-4 text-xl font-semibold text-gray-800">
						Similar Sections
					</h3>
					<div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 transition-all duration-300 hover:shadow-md">
						<p className="text-gray-700 whitespace-pre-line">
							{sections.similarSections.join("\n")}
						</p>
					</div>
				</div>
			)}

			{/* Recommendations */}
			{sections.recommendation && sections.recommendation.length > 0 && (
				<div className="mb-8">
					<h3 className="mb-4 text-xl font-semibold text-gray-800">
						Recommendations
					</h3>
					<div className="p-6 bg-green-50 rounded-lg border border-green-200 transition-all duration-300 hover:shadow-md">
						<p className="text-gray-700 whitespace-pre-line">
							{sections.recommendation.join("\n")}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

// Wrap with dynamic to prevent SSR issues
const ComparisonResult = dynamic(() => Promise.resolve(ComparisonResultBase), {
	ssr: false,
});

export default ComparisonResult;
