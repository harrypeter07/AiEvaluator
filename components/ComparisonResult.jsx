"use client";

import React, { useEffect, useState } from 'react';
import { Download, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const ComparisonResult = ({ response }) => {
    const resultRef = React.useRef(null);
    const [mounted, setMounted] = useState(false);
    const [sections, setSections] = useState(null);
    const [similarityScore, setSimilarityScore] = useState(0);
console.log("hello samikhaa" , response)
    useEffect(() => {
        setMounted(true);
        if (response?.feedback) {
            setSections(parseResponse(response.feedback));
            setSimilarityScore(response.comparison?.similarityScore || 0);
        }
    }, [response]);

    const parseResponse = (text) => {
        const sections = {};
        const lines = text.split('\n');
        let currentSection = null;

        lines.forEach((line) => {
            if (line.startsWith('Similarity Score:')) {
                sections.similarityScore = parseInt(line.match(/\d+/)[0]);
            } else if (line.startsWith('Detailed Analysis:')) {
                currentSection = 'detailedAnalysis';
                sections[currentSection] = [];
            } else if (line.startsWith('Similar Sections:')) {
                currentSection = 'similarSections';
                sections[currentSection] = [];
            } else if (line.startsWith('Recommendation:')) {
                currentSection = 'recommendation';
                sections[currentSection] = [];
            } else if (currentSection && line.trim()) {
                sections[currentSection].push(line.trim());
            }
        });

        return sections;
    };

    const getSimilarityColor = (score) => {
        if (score >= 80) return 'text-red-500';
        if (score >= 60) return 'text-orange-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getSimilarityIcon = (score) => {
        if (score >= 80) return <AlertTriangle className="w-6 h-6 text-red-500" />;
        if (score >= 60) return <AlertTriangle className="w-6 h-6 text-orange-500" />;
        if (score >= 40) return <Info className="w-6 h-6 text-yellow-500" />;
        return <CheckCircle className="w-6 h-6 text-green-500" />;
    };

    const handleDownload = async () => {
        const element = resultRef.current;
        const opt = {
            margin: 1,
            filename: 'comparison-analysis.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };
        await html2pdf().set(opt).from(element).save();
    };

    if (!mounted || !sections) {
        return null;
    }

    return (
        <div ref={resultRef} className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">PDF Comparison Analysis</h2>
                <button
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                </button>
            </div>

            {/* File Names */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Files Compared</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">File 1:</p>
                        <p className="font-medium text-gray-800">{response.comparison.file1Name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">File 2:</p>
                        <p className="font-medium text-gray-800">{response.comparison.file2Name}</p>
                    </div>
                </div>
            </div>

            {/* Similarity Score Card */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {getSimilarityIcon(similarityScore)}
                        <h3 className="ml-3 text-xl font-semibold text-gray-800">Similarity Score</h3>
                    </div>
                    <div className={`text-4xl font-bold ${getSimilarityColor(similarityScore)}`}>
                        {similarityScore}%
                    </div>
                </div>
            </div>

            {/* Detailed Analysis */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Analysis</h3>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-gray-700 whitespace-pre-line">
                        {sections.detailedAnalysis?.join('\n')}
                    </p>
                </div>
            </div>

            {/* Similar Sections */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Similar Sections</h3>
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <ul className="list-disc list-inside text-gray-700">
                        {sections.similarSections?.map((section, index) => (
                            <li key={index} className="mb-2">{section}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recommendation */}
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendation</h3>
                <div className={`p-6 rounded-lg border ${
                    similarityScore >= 80 
                        ? 'bg-red-50 border-red-200' 
                        : similarityScore >= 60 
                            ? 'bg-orange-50 border-orange-200'
                            : similarityScore >= 40
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-green-50 border-green-200'
                }`}>
                    <p className="text-gray-700 whitespace-pre-line">
                        {sections.recommendation?.join('\n')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComparisonResult; 