"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import {
	Download,
	Printer,
	AlertTriangle,
	CheckCircle,
	Info,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import PropTypes from "prop-types";
import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";

const ErrorFallback = ({ error, resetErrorBoundary }) => (
	<div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-md">
		<h3 className="text-xl font-semibold text-red-800 mb-2">
			Something went wrong:
		</h3>
		<p className="text-red-600 mb-4">{error.message}</p>
		<button
			onClick={resetErrorBoundary}
			className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
		>
			Try again
		</button>
	</div>
);

ErrorFallback.propTypes = {
	error: PropTypes.shape({
		message: PropTypes.string.isRequired,
	}).isRequired,
	resetErrorBoundary: PropTypes.func.isRequired,
};

const ResultPreviewBase = ({ response }) => {
	const resultRef = useRef(null);
	const [isClient, setIsClient] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const parseResponse = (text) => {
		try {
			const sections = {};
			const lines = text.split("\n");
			let currentSection = null;

			lines.forEach((line) => {
				if (line.startsWith("**Student Information:**")) {
					currentSection = "studentInfo";
					sections[currentSection] = [];
				} else if (line.startsWith("**Keywords/Topics:**")) {
					currentSection = "keywords";
					sections[currentSection] = [];
				} else if (line.startsWith("**Overall Assessment:**")) {
					currentSection = "assessment";
					sections[currentSection] = [];
				} else if (line.startsWith("**Detailed Feedback:**")) {
					currentSection = "feedback";
					sections[currentSection] = [];
				} else if (line.startsWith("**Score:**")) {
					currentSection = "score";
					sections[currentSection] = [];
				} else if (line.startsWith("**Justification:**")) {
					currentSection = "justification";
					sections[currentSection] = [];
				} else if (currentSection && line.trim()) {
					sections[currentSection].push(line.trim());
				}
			});

			const cleanedSections = {};
			for (const [sectionHeader, content] of Object.entries(sections)) {
				switch (sectionHeader) {
					case "Student Information":
					case "Keywords/Topics":
					case "Detailed Feedback":
						cleanedSections[sectionHeader] = content.map((item) =>
							item.replace(/^\* /, "").trim()
						);
						break;
					default:
						cleanedSections[sectionHeader] = content.map((item) =>
							item.replace(/^\*+\s*/, "").trim()
						);
				}
			}

			return cleanedSections;
		} catch (error) {
			console.error("Error parsing response:", error);
			setError("Failed to parse the response data");
			return null;
		}
	};

	// Memoize the parsed response to prevent unnecessary re-renders
	const parsedSections = useMemo(() => {
		if (!response) return null;
		return parseResponse(response);
	}, [response]);

	if (!response) return null;

	const handleDownload = async () => {
		if (!isClient) return;

		try {
			const element = resultRef.current;
			if (!element) return;

			const opt = {
				margin: 1,
				filename: "assignment-feedback.pdf",
				image: { type: "jpeg", quality: 0.98 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
			};
			await html2pdf().set(opt).from(element).save();
		} catch (error) {
			console.error("Error generating PDF:", error);
			setError("Failed to generate PDF. Please try again.");
		}
	};

	const handlePrint = () => {
		if (!isClient) return;

		try {
			window.print();
		} catch (error) {
			console.error("Error printing:", error);
			setError("Failed to print. Please try again.");
		}
	};

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-md">
				<h3 className="text-xl font-semibold text-red-800 mb-2">
					Something went wrong:
				</h3>
				<p className="text-red-600 mb-4">{error}</p>
				<button
					onClick={() => setError(null)}
					className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
				>
					Try again
				</button>
			</div>
		);
	}

	if (!parsedSections) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-md">
				<p className="text-yellow-600">No results to display</p>
			</div>
		);
	}

	const getScoreColor = (text) => {
		const score = text?.join("")?.match(/\d+/)?.[0];
		if (!score) return "text-gray-600";
		const numScore = parseInt(score);
		if (numScore >= 90) return "text-green-600";
		if (numScore >= 80) return "text-blue-600";
		if (numScore >= 70) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreIcon = (text) => {
		const score = text?.join("")?.match(/\d+/)?.[0];
		if (!score) return <Info className="w-6 h-6 text-gray-500" />;
		const numScore = parseInt(score);
		if (numScore >= 90)
			return <CheckCircle className="w-6 h-6 text-green-500" />;
		if (numScore >= 80) return <Info className="w-6 h-6 text-blue-500" />;
		if (numScore >= 70) return <Info className="w-6 h-6 text-yellow-500" />;
		return <AlertTriangle className="w-6 h-6 text-red-500" />;
	};

	return (
		<div ref={resultRef} className="bg-white rounded-lg shadow-lg p-8 mt-6">
			<div className="flex justify-end space-x-4 mb-6">
				<button
					onClick={handleDownload}
					className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
				>
					<Download className="w-4 h-4 mr-2" />
					Download PDF
				</button>
				<button
					onClick={handlePrint}
					className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
				>
					<Printer className="w-4 h-4 mr-2" />
					Print
				</button>
			</div>

			<div className="space-y-6">
				{/* Student Information */}
				{parsedSections.studentInfo && (
					<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
						<h3 className="text-lg font-semibold text-blue-800 mb-2">
							Student Information
						</h3>
						<p className="text-blue-700 whitespace-pre-line">
							{parsedSections.studentInfo.join("\n")}
						</p>
					</div>
				)}

				{/* Keywords/Topics */}
				{parsedSections.keywords && (
					<div className="p-4 bg-green-50 rounded-lg border border-green-200">
						<h3 className="text-lg font-semibold text-green-800 mb-2">
							Keywords/Topics
						</h3>
						<p className="text-green-700 whitespace-pre-line">
							{parsedSections.keywords.join("\n")}
						</p>
					</div>
				)}

				{/* Overall Assessment */}
				{parsedSections.assessment && (
					<div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
						<h3 className="text-lg font-semibold text-purple-800 mb-2">
							Overall Assessment
						</h3>
						<p className="text-purple-700 whitespace-pre-line">
							{parsedSections.assessment.join("\n")}
						</p>
					</div>
				)}

				{/* Detailed Feedback */}
				{parsedSections.feedback && (
					<div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
						<h3 className="text-lg font-semibold text-yellow-800 mb-2">
							Detailed Feedback
						</h3>
						<p className="text-yellow-700 whitespace-pre-line">
							{parsedSections.feedback.join("\n")}
						</p>
					</div>
				)}

				{/* Score */}
				{parsedSections.score && (
					<div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								{getScoreIcon(parsedSections.score)}
								<h3 className="ml-2 text-lg font-semibold text-pink-800">
									Score
								</h3>
							</div>
							<p
								className={`text-2xl font-bold ${getScoreColor(
									parsedSections.score
								)}`}
							>
								{parsedSections.score.join(" ")}
							</p>
						</div>
					</div>
				)}

				{/* Justification */}
				{parsedSections.justification && (
					<div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
						<h3 className="text-lg font-semibold text-teal-800 mb-2">
							Score Justification
						</h3>
						<p className="text-teal-700 whitespace-pre-line">
							{parsedSections.justification.join("\n")}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

ResultPreviewBase.propTypes = {
	response: PropTypes.string.isRequired,
};

// Wrap the component with dynamic import to disable SSR
const ResultPreview = dynamic(() => Promise.resolve(ResultPreviewBase), {
	ssr: false,
});

export default ResultPreview;
