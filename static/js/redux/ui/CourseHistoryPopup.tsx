import React, { useEffect, useState } from "react";

interface TranscriptData {
  courses: string[];
}

interface CourseHistoryPopupProps {
  onClose: () => void;
}

const CourseHistoryPopup: React.FC<CourseHistoryPopupProps> = ({ onClose }) => {
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("transcriptData");
      if (savedData) {
        const parsedData: TranscriptData = JSON.parse(savedData);
        setCourses(parsedData.courses || []);
      }
    } catch (error) {
      // console.error("Failed to load transcript:", error);
    }
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] shadow-xl relative">
        {courses.length > 0 ? (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course}
                className="p-2 border-b border-gray-100"
                style={{
                  color: "lightgray",
                  fontSize: "small",
                  lineHeight: "1.5",
                  userSelect: "none",
                }}
              >
                {course}
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              marginTop: "5px",
              lineHeight: "1.5",
              userSelect: "none",
              fontSize: "small",
              color: "gray",
            }}
          >
            No course history found
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseHistoryPopup;
