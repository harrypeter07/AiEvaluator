

export default function Home() {
  return (
    <div className="h-full w-full">
<h1>DONE </h1>

        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Assignment Checker</h1>
            <p className="text-lg text-gray-600 mb-6">Upload and analyze student assignments easily.</p>
            
            {/* Button to navigate to Dashboard */}
            <a href="/dashboard" className="bg-blue-500 text-white px-6 py-3 rounded">
                Go to Dashboard
            </a>
        </div>
    </div>
  );
}
