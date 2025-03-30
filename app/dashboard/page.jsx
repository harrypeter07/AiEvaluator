"use client";
import dynamic from "next/dynamic";
import DashboardContent from "@/components/DashboardContent";

// Wrap the component with dynamic import to disable SSR
const Dashboard = dynamic(() => Promise.resolve(DashboardContent), {
	ssr: false,
});

export default Dashboard;
