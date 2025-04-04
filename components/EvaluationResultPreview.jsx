import React from "react";
import { Download, Printer } from "lucide-react";

const EvaluationResultPreview = ({ evaluation }) => {
	if (!evaluation) return null;

	const handlePrint = () => {
		window.print();
	};

	const handleDownload = () => {
		const element = document.createElement('a');
		const file = new Blob([JSON.stringify(evaluation, null, 2)], {type: 'application/json'});
		element.href = URL.createObjectURL(file);
		element.download = `evaluation-${evaluation.submissionId}.json`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};

	// Parse feedback sections
	const parseFeedback = (feedback) => {
		if (!feedback) return {
			studentInfo: [],
			keywords: [],
			overallAssessment: [],
			detailedFeedback: [],
			score: [],
			justification: [],
			improvements: []
		};

		const sections = {
			studentInfo: [],
			keywords: [],
			overallAssessment: [],
			detailedFeedback: [],
			score: [],
			justification: [],
			improvements: []
		};

		let currentSection = '';
		const lines = feedback.split('\n');

		for (const line of lines) {
			const trimmedLine = line.trim();
			
			// Skip empty lines
			if (!trimmedLine) continue;

			// Check for section headers
			if (trimmedLine.includes('**Student Information:**')) {
				currentSection = 'studentInfo';
				continue;
			} else if (trimmedLine.includes('**Keywords/Topics:**')) {
				currentSection = 'keywords';
				continue;
			} else if (trimmedLine.includes('**Overall Assessment:**')) {
				currentSection = 'overallAssessment';
				continue;
			} else if (trimmedLine.includes('**Detailed Feedback:**')) {
				currentSection = 'detailedFeedback';
				continue;
			} else if (trimmedLine.includes('**Score:**')) {
				currentSection = 'score';
				continue;
			} else if (trimmedLine.includes('**Justification:**')) {
				currentSection = 'justification';
				continue;
			}

			// Special handling for Areas for Improvement
			if (trimmedLine.includes('Areas for Improvement:') || 
				trimmedLine.includes('* Areas for Improvement:')) {
				currentSection = 'improvements';
				continue;
			}

			// Add content to current section if we have one
			if (currentSection && sections[currentSection]) {
				let cleanLine = trimmedLine;
				
				// Remove bullet points
				if (cleanLine.startsWith('* ')) {
					cleanLine = cleanLine.substring(2);
				}
				
				// Remove any remaining markdown bold syntax
				cleanLine = cleanLine.replace(/\*\*/g, '');

				// For improvements section, split on colon if it exists
				if (currentSection === 'improvements') {
					const parts = cleanLine.split(':').map(part => part.trim());
					if (parts.length > 1) {
						sections[currentSection].push({
							title: parts[0],
							description: parts[1]
						});
					} else {
						// If no colon, treat the whole line as description
						sections[currentSection].push({
							title: '',
							description: cleanLine
						});
					}
				} else {
					sections[currentSection].push(cleanLine);
				}
			}
		}

		// If improvements section is empty but there's content in detailed feedback that looks like improvements
		if (sections.improvements.length === 0 && sections.detailedFeedback.length > 0) {
			const improvementLine = sections.detailedFeedback.find(line => 
				line.toLowerCase().includes('areas for improvement:')
			);
			
			if (improvementLine) {
				const improvementIndex = sections.detailedFeedback.indexOf(improvementLine);
				const improvements = sections.detailedFeedback.slice(improvementIndex + 1);
				sections.improvements = improvements.map(imp => {
					const parts = imp.split(':').map(part => part.trim());
					return {
						title: parts[0] || '',
						description: parts[1] || parts[0]
					};
				});
				// Remove the improvements from detailed feedback
				sections.detailedFeedback = sections.detailedFeedback.slice(0, improvementIndex);
			}
		}

		return sections;
	};

	const sections = parseFeedback(evaluation.feedback);

	return (
		<div className="bg-white rounded-lg shadow-lg p-4 print:shadow-none">
			{/* Actions Bar */}
			<div className="flex justify-end gap-2 mb-4 print:hidden">
				<button
					onClick={handleDownload}
					className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
				>
					<Download className="w-4 h-4 mr-1" />
					Download
				</button>
				<button
					onClick={handlePrint}
					className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
				>
					<Printer className="w-4 h-4 mr-1" />
					Print
				</button>
			</div>

			{/* Bento Grid Layout */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
				{/* Student Info */}
				<div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
					<h3 className="font-semibold text-indigo-900 mb-2">Student Information</h3>
					<div className="space-y-1 text-indigo-700">
						{sections.studentInfo.map((info, index) => (
							<p key={index}>{info}</p>
						))}
					</div>
				</div>

				{/* Keywords/Topics */}
				<div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
					<h3 className="font-semibold text-purple-900 mb-2">Keywords/Topics</h3>
					<div className="space-y-1 text-purple-700">
						{sections.keywords.map((keyword, index) => (
							<p key={index}>{keyword}</p>
						))}
					</div>
				</div>

				{/* Overall Assessment */}
				<div className="bg-emerald-50 rounded-lg p-4 md:col-span-2 border border-emerald-100">
					<h3 className="font-semibold text-emerald-900 mb-2">Overall Assessment</h3>
					<div className="text-emerald-700">
						{sections.overallAssessment.map((text, index) => (
							<p key={index} className="mb-2">{text}</p>
						))}
					</div>
				</div>

				{/* Detailed Feedback */}
				<div className="bg-sky-50 rounded-lg p-4 md:col-span-2 border border-sky-100">
					<h3 className="font-semibold text-sky-900 mb-2">Detailed Feedback</h3>
					<div className="text-sky-700 space-y-2">
						{sections.detailedFeedback.map((feedback, index) => (
							<p key={index}>{feedback}</p>
						))}
					</div>
				</div>

				{/* Score */}
				<div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
					<h3 className="font-semibold text-blue-900 mb-2">Score</h3>
					<div className="flex items-center justify-center">
						<span className="text-3xl font-bold text-blue-600">{evaluation.score}/100</span>
					</div>
				</div>

				{/* Score Justification */}
				<div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
					<h3 className="font-semibold text-cyan-900 mb-2">Score Justification</h3>
					<div className="text-cyan-700 space-y-1">
						{sections.justification.map((text, index) => (
							<p key={index}>{text}</p>
						))}
					</div>
				</div>

				{/* Areas for Improvement */}
				<div className="bg-amber-50 rounded-lg p-4 md:col-span-2 border border-amber-100">
					<h3 className="font-semibold text-amber-900 mb-2">Areas for Improvement</h3>
					<div className="space-y-2">
						{sections.improvements.map((improvement, index) => (
							<div key={index} className="bg-white rounded p-3 text-amber-800 border border-amber-200 hover:bg-amber-50 transition-colors">
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
