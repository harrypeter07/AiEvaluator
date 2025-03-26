import React, { useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const ResultPreview = ({ response }) => {
  const resultRef = useRef(null);

  if (!response) return null;

  const parseResponse = (text) => {
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
      switch(sectionHeader) {
        case 'Student Information':
          cleanedSections[sectionHeader] = content.map(item => 
            item.replace(/^\* /, '').trim()
          );
          break;
        case 'Keywords/Topics':
          cleanedSections[sectionHeader] = content.map(item => 
            item.replace(/^\* /, '').trim()
          );
          break;
        case 'Detailed Feedback':
          cleanedSections[sectionHeader] = content.map(item => 
            item.replace(/^\* /, '').trim()
          );
          break;
        default:
          cleanedSections[sectionHeader] = content.map(item => 
            item.replace(/^\*+\s*/, '').trim()
          );
      }
    }

    return cleanedSections;
  };

  // Export to PDF function
  const exportToPDF = () => {
    const element = resultRef.current;
    const opt = {
      margin:       1,
      filename:     'analysis_result.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Parse the response
  const parsedSections = parseResponse(response);

  return (
    <div ref={resultRef} className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Analysis Result</h2>
        <div className="flex space-x-4">
          <button 
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="mr-2" size={20} />
            Export PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Printer className="mr-2" size={20} />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Student Information - Left Top */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Information</h3>
          <div className="space-y-2">
            {parsedSections['Student Information']?.map((item, index) => {
              const [key, value] = item.split(': ');
              return (
                <div key={index} className="flex">
                  <span className="font-medium w-1/3">{key}:</span>
                  <span className="text-gray-700">{value || 'N/A'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keywords/Topics - Right Top */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Keywords/Topics</h3>
          <div className="flex flex-wrap gap-2">
            {parsedSections['Keywords/Topics']?.map((topic, index) => (
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

      {/* Overall Assessment */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 shadow-md mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Assessment</h3>
        <p className="text-gray-700">
          {parsedSections['Overall Assessment']}
        </p>
      </div>

      {/* Detailed Feedback */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-md mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Feedback</h3>
        <ul className="space-y-3">
          {parsedSections['Detailed Feedback']?.map((item, index) => {
            const [subTitle, ...descriptionParts] = item.split(': ');
            const description = descriptionParts.join(': ');
            return (
              <li key={index} className="text-gray-700">
                <span className="font-semibold text-gray-900 block mb-1">{subTitle}:</span>
                <p className="pl-2">{description}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Score and Justification */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Score</h3>
          <p className="text-4xl font-bold text-pink-700">
            {parsedSections['Score']}
          </p>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Justification</h3>
          <p className="text-gray-700">
            {parsedSections['Justification']}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPreview;