"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Loading component
const Loading = () => (
	<div className="flex items-center justify-center h-screen">
		<div className="text-xl">Loading...</div>
	</div>
);

// Wrap the component with dynamic import
const DashboardClient = dynamic(() => import("@/components/DashboardContent"), {
	ssr: false,
	loading: () => <Loading />,
});

// Main page component (client component)
export default function DashboardPage() {
	return (
		<Suspense fallback={<Loading />}>
			<DashboardClient />
		</Suspense>
	);
}
