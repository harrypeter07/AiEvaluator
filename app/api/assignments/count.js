import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import { authOptions } from "@/lib/authOptions";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    try {
        await connectDB();
        const count = await Assignment.countDocuments({ userEmail: session.user.email });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching assignment count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
