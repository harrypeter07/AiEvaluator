// app/classroom/[courseId]/[courseWorkId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function CourseWorkDetails() {
  const { courseId, courseWorkId } = useParams();
  const { data: session, status } = useSession();
  const [coursework, setCoursework] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.provider === "google") {
      fetchCourseWorkDetails();
    }
  }, [status, session, courseId, courseWorkId]);

  const fetchCourseWorkDetails = async () => {
    try {
      const res = await fetch(
        `/api/assignments/fetchCourseWorkDetails?courseId=${courseId}&courseWorkId=${courseWorkId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setCoursework(data.coursework);
    } catch (error) {
      console.error("Error fetching coursework details:", error);
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Please log in at <a href="/login">/login</a>.</p>;
  if (session?.provider !== "google") return <p>Please log in with Google to see Classroom data.</p>;

  if (!coursework) return <p>Loading coursework details...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{coursework.title}</h1>
      <p className="mb-4">
        <strong>Due: </strong>
        {coursework.dueDate
          ? `${coursework.dueDate.month}/${coursework.dueDate.day}/${coursework.dueDate.year}`
          : "No due date"}
      </p>

      {/* Message/Description */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Message</h2>
        <p>{coursework.description || "No description provided."}</p>
      </div>

      {/* Attachments/Materials */}
      <div>
        <h2 className="text-xl font-semibold">Attachments</h2>
        {coursework.materials && coursework.materials.length > 0 ? (
          <ul className="list-disc pl-5">
            {coursework.materials.map((material, index) => (
              <li key={index}>
                {material.driveFile ? (
                  <a
                    href={material.driveFile.driveFile.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {material.driveFile.driveFile.title || "Unnamed File"}
                  </a>
                ) : material.link ? (
                  <a
                    href={material.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {material.link.title || material.link.url}
                  </a>
                ) : material.youtubeVideo ? (
                  <a
                    href={material.youtubeVideo.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {material.youtubeVideo.title || "Unnamed Video"}
                  </a>
                ) : (
                  "Unknown attachment type"
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No attachments available.</p>
        )}
      </div>
    </div>
  );
}