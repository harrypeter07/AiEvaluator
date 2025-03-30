"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import DashboardContent from "@/components/DashboardContent";

// Loading component
const Loading = () => (
	<div className="flex items-center justify-center h-screen">
		<div className="text-xl">Loading...</div>
	</div>
);

// Wrap the component with dynamic import to disable SSR
const Dashboard = dynamic(() => Promise.resolve(DashboardContent), {
	ssr: false,
	loading: () => <Loading />,
});

// Main page component
export default function DashboardPage() {
	return (
		<Suspense fallback={<Loading />}>
			<Dashboard />
		</Suspense>
	);
}
