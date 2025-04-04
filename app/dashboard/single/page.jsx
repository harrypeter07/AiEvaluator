"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import these components only on the client side
const FileHandler = dynamic(() => import("@/components/FileHandler"), {
  ssr: false
});

const ResultPreview = dynamic(() => import("@/components/ResultPreview"), {
  ssr: false
});

const SingleAnalysisPage = () => {
  const { data: session, status } = useSession();
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  const handleResult = (resultData) => {
    setResult(resultData);
  };

  if (status === "loading" || isSubmitting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">
            {isSubmitting ? "Analyzing PDF..." : "Loading..."}
          </div>
          {isSubmitting && (
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments depending on the file size
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analyze Assignment</h1>
          <p className="text-gray-600 mt-1">
            Upload a PDF file to analyze its content
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Upload PDF</h2>
          <p className="text-gray-600">
            Select a PDF file to analyze its content and receive feedback
          </p>
        </div>

        <FileHandler
          mode="single"
          onResult={handleResult}
          onLoadingChange={setIsSubmitting}
        />
      </div>

      {result && (
        <div className="mt-8">
          <ResultPreview response={result} />
        </div>
      )}
    </div>
  );
};

export default SingleAnalysisPage;