"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
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

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Memoize the parsed response to prevent unnecessary re-renders
	const parsedSections = useMemo(() => {
		if (!response) return null;
		return parseResponse(response);
	}, [response]);

	if (!response) return null;

	const parseResponse = (text) => {
		try {
			const sections = {};
			const lines = text.split("\n");
			let currentSection = null;

			lines.forEach((line) => {
				const sectionHeaderMatch = line.match(/^\*\*(.+):\*\*$/);
				if (sectionHeaderMatch) {
					currentSection = sectionHeaderMatch[1];
					sections[currentSection] = [];
				} else if (currentSection) {
					if (line.trim() && !line.match(/^\*\*.*:\*\*$/)) {
						sections[currentSection].push(line.trim());
					}
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
			throw new Error("Failed to parse the response data");
		}
	};

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
			alert("Failed to generate PDF. Please try again.");
		}
	};

	const handlePrint = () => {
		if (!isClient) return;

		try {
			window.print();
		} catch (error) {
			console.error("Error printing:", error);
			alert("Failed to print. Please try again.");
		}
	};

	if (!parsedSections) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-md">
				<p className="text-yellow-600">No results to display</p>
			</div>
		);
	}

	return (
		<ErrorBoundary
			FallbackComponent={ErrorFallback}
			onReset={() => {
				// Reset the error boundary state
				window.location.reload();
			}}
		>
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

				<div className="grid grid-cols-2 gap-6">
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md">
						<h3 className="text-xl font-semibold text-gray-800 mb-4">
							Student Information
						</h3>
						<div className="space-y-2">
							{parsedSections["Student Information"]?.map((item, index) => {
								const [key, value] = item.split(": ");
								return (
									<div key={index} className="flex">
										<span className="font-medium w-1/3">{key}:</span>
										<span className="text-gray-700">{value || "N/A"}</span>
									</div>
								);
							})}
						</div>
					</div>

					<div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
						<h3 className="text-xl font-semibold text-gray-800 mb-4">
							Keywords/Topics
						</h3>
						<div className="flex flex-wrap gap-2">
							{parsedSections["Keywords/Topics"]?.map((topic, index) => (
								<span
									key={index}
									className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
								>
									{topic}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="bg-purple-50 border border-purple-200 rounded-lg p-6 shadow-md mt-6">
					<h3 className="text-xl font-semibold text-gray-800 mb-4">
						Overall Assessment
					</h3>
					<p className="text-gray-700">
						{parsedSections["Overall Assessment"]}
					</p>
				</div>

				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-md mt-6">
					<h3 className="text-xl font-semibold text-gray-800 mb-4">
						Detailed Feedback
					</h3>
					<ul className="space-y-3">
						{parsedSections["Detailed Feedback"]?.map((item, index) => {
							const [subTitle, ...descriptionParts] = item.split(": ");
							const description = descriptionParts.join(": ");
							return (
								<li key={index} className="text-gray-700">
									<span className="font-semibold text-gray-900 block mb-1">
										{subTitle}:
									</span>
									<p className="pl-2">{description}</p>
								</li>
							);
						})}
					</ul>
				</div>

				<div className="grid grid-cols-2 gap-6 mt-6">
					<div className="bg-pink-50 border border-pink-200 rounded-lg p-6 shadow-md">
						<h3 className="text-xl font-semibold text-gray-800 mb-4">Score</h3>
						<p className="text-4xl font-bold text-pink-700">
							{parsedSections["Score"]}
						</p>
					</div>
					<div className="bg-teal-50 border border-teal-200 rounded-lg p-6 shadow-md">
						<h3 className="text-xl font-semibold text-gray-800 mb-4">
							Justification
						</h3>
						<p className="text-gray-700">{parsedSections["Justification"]}</p>
					</div>
				</div>
			</div>
		</ErrorBoundary>
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
