import SignupForm from "@/components/SignupForm";
// import SignupForm from "../../components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
        <SignupForm />
      </div>
    </div>
  );
}
