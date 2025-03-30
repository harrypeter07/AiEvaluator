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

// Main page component (client component)
export default function DashboardPage() {
	return (
		<Suspense fallback={<Loading />}>
			<DashboardContent />
		</Suspense>
	);
}
