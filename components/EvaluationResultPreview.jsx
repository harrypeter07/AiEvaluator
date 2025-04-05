import React from "react";
import { Download, Printer } from "lucide-react";

const EvaluationResultPreview = ({ evaluation }) => {
	if (!evaluation) return null;

	const handlePrint = () => {
		window.print();
	};

	const handleDownload = () => {
		const element = document.createElement("a");
		const file = new Blob([JSON.stringify(evaluation, null, 2)], {
			type: "application/json",
		});
		element.href = URL.createObjectURL(file);
		element.download = `evaluation-${evaluation.submissionId}.json`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};

	// Parse feedback sections
	const parseFeedback = (feedback) => {
		if (!feedback)
			return {
				studentInfo: [],
				keywords: [],
				overallAssessment: [],
				detailedFeedback: [],
				score: [],
				justification: [],
				improvements: [],
			};

		const sections = {
			studentInfo: [],
			keywords: [],
			overallAssessment: [],
			detailedFeedback: [],
			score: [],
			justification: [],
			improvements: [],
		};

		let currentSection = "";
		const lines = feedback.split("\n");

		for (const line of lines) {
			const trimmedLine = line.trim();

			// Skip empty lines
			if (!trimmedLine) continue;

			// Check for section headers
			if (trimmedLine.includes("**Student Information:**")) {
				currentSection = "studentInfo";
				continue;
			} else if (trimmedLine.includes("**Keywords/Topics:**")) {
				currentSection = "keywords";
				continue;
			} else if (trimmedLine.includes("**Overall Assessment:**")) {
				currentSection = "overallAssessment";
				continue;
			} else if (trimmedLine.includes("**Detailed Feedback:**")) {
				currentSection = "detailedFeedback";
				continue;
			} else if (trimmedLine.includes("**Score:**")) {
				currentSection = "score";
				continue;
			} else if (trimmedLine.includes("**Justification:**")) {
				currentSection = "justification";
				continue;
			}

			// Special handling for Areas for Improvement
			if (
				trimmedLine.includes("Areas for Improvement:") ||
				trimmedLine.includes("* Areas for Improvement:")
			) {
				currentSection = "improvements";
				continue;
			}

			// Add content to current section if we have one
			if (currentSection && sections[currentSection]) {
				let cleanLine = trimmedLine;

				// Remove bullet points
				if (cleanLine.startsWith("* ")) {
					cleanLine = cleanLine.substring(2);
				}

				// Remove any remaining markdown bold syntax
				cleanLine = cleanLine.replace(/\*\*/g, "");

				// For improvements section, split on colon if it exists
				if (currentSection === "improvements") {
					const parts = cleanLine.split(":").map((part) => part.trim());
					if (parts.length > 1) {
						sections[currentSection].push({
							title: parts[0],
							description: parts[1],
						});
					} else {
						// If no colon, treat the whole line as description
						sections[currentSection].push({
							title: "",
							description: cleanLine,
						});
					}
				} else {
					sections[currentSection].push(cleanLine);
				}
			}
		}

		// If improvements section is empty but there's content in detailed feedback that looks like improvements
		if (
			sections.improvements.length === 0 &&
			sections.detailedFeedback.length > 0
		) {
			const improvementLine = sections.detailedFeedback.find((line) =>
				line.toLowerCase().includes("areas for improvement:")
			);

			if (improvementLine) {
				const improvementIndex =
					sections.detailedFeedback.indexOf(improvementLine);
				const improvements = sections.detailedFeedback.slice(
					improvementIndex + 1
				);
				sections.improvements = improvements.map((imp) => {
					const parts = imp.split(":").map((part) => part.trim());
					return {
						title: parts[0] || "",
						description: parts[1] || parts[0],
					};
				});
				// Remove the improvements from detailed feedback
				sections.detailedFeedback = sections.detailedFeedback.slice(
					0,
					improvementIndex
				);
			}
		}

		return sections;
	};

	const sections = parseFeedback(evaluation.feedback);

	return (
		<div className="p-4 bg-white rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl print:shadow-none">
			{/* Actions Bar */}
			<div className="flex gap-2 justify-end mb-4 print:hidden">
				<button
					onClick={handleDownload}
					className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-all duration-300 transform hover:scale-105 border border-blue-200"
				>
					<Download className="mr-1 w-4 h-4" />
					Download
				</button>
				<button
					onClick={handlePrint}
					className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 border border-gray-200"
				>
					<Printer className="mr-1 w-4 h-4" />
					Print
				</button>
			</div>

			{/* Bento Grid Layout */}
			<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
				{/* Student Info */}
				<div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
					<h3 className="mb-2 font-semibold text-indigo-900">
						Student Information
					</h3>
					<div className="space-y-1 text-indigo-700">
						{sections.studentInfo.map((info, index) => (
							<p key={index}>{info}</p>
						))}
					</div>
				</div>

				{/* Keywords/Topics */}
				<div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
					<h3 className="mb-2 font-semibold text-purple-900">
						Keywords/Topics
					</h3>
					<div className="space-y-1 text-purple-700">
						{sections.keywords.map((keyword, index) => (
							<p key={index}>{keyword}</p>
						))}
					</div>
				</div>

				{/* Overall Assessment */}
				<div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 md:col-span-2">
					<h3 className="mb-2 font-semibold text-emerald-900">
						Overall Assessment
					</h3>
					<div className="text-emerald-700">
						{sections.overallAssessment.map((text, index) => (
							<p key={index} className="mb-2">
								{text}
							</p>
						))}
					</div>
				</div>

				{/* Detailed Feedback */}
				<div className="p-4 bg-sky-50 rounded-lg border border-sky-100 md:col-span-2">
					<h3 className="mb-2 font-semibold text-sky-900">Detailed Feedback</h3>
					<div className="space-y-2 text-sky-700">
						{sections.detailedFeedback.map((feedback, index) => (
							<p key={index}>{feedback}</p>
						))}
					</div>
				</div>

				{/* Score */}
				<div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
					<h3 className="mb-2 font-semibold text-blue-900">Score</h3>
					<div className="flex justify-center items-center">
						<span className="text-3xl font-bold text-blue-600">
							{evaluation.score}/100
						</span>
					</div>
				</div>

				{/* Score Justification */}
				<div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100 transition-all duration-300 hover:shadow-md">
					<h3 className="mb-2 font-semibold text-cyan-900">
						Score Justification
					</h3>
					<div className="space-y-1 text-cyan-700">
						{sections.justification.map((text, index) => (
							<p key={index}>{text}</p>
						))}
					</div>
				</div>

				{/* Areas for Improvement */}
				<div className="p-4 bg-amber-50 rounded-lg border border-amber-100 md:col-span-2">
					<h3 className="mb-2 font-semibold text-amber-900">
						Areas for Improvement
					</h3>
					<div className="space-y-2">
						{sections.improvements.map((improvement, index) => (
							<div
								key={index}
								className="p-3 text-amber-800 bg-white rounded border border-amber-200 transition-all duration-300 hover:bg-amber-50 hover:shadow-sm"
							>
								{improvement.title ? (
									<>
										<span className="font-medium">{improvement.title}</span>
										<span className="mx-1">:</span>
										<span>{improvement.description}</span>
									</>
								) : (
									<span>{improvement.description}</span>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default EvaluationResultPreview;
