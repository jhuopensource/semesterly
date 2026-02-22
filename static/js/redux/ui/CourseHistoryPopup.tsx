import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../state/slices/themeSlice";

interface TranscriptData {
  courses: string[];
}

interface CourseHistoryPopupProps {
  onClose: () => void;
}

const CourseHistoryPopup: React.FC<CourseHistoryPopupProps> = ({ onClose }) => {
  const [courses, setCourses] = useState<string[]>([]);
  const theme = useAppSelector(selectTheme);
  const isDark = theme?.name === "dark";

  // Mirror the sidebar's background and text colors
  const colors = {
    panel:      isDark ? "#2b2d31" : "#f5f6f7",
    border:     isDark ? "rgba(255,255,255,0.08)" : "#e8e8e8",
    headerText: isDark ? "#e8e8e8" : "#222",
    subText:    isDark ? "#888" : "#888",
    row:        isDark ? "#3a3c41" : "#edeef0",
    rowText:    isDark ? "#d0d0d0" : "#333",
    footerText: isDark ? "#666" : "#aaa",
    closeHover: isDark ? "#3a3c41" : "#f0f0f0",
    closeColor: isDark ? "#aaa" : "#888",
  };

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(3px)",
      }}
      onClick={onClose}
    >
      {/* Modal panel — stop clicks propagating to backdrop */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.panel,
          borderRadius: "14px",
          boxShadow: "0 12px 48px rgba(0,0,0,0.28)",
          width: "min(520px, 92vw)",
          maxHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa fa-history" style={{ color: colors.subText }} />
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: colors.headerText }}>
              Course History
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.3rem",
              lineHeight: 1,
              color: colors.closeColor,
              padding: "4px 8px",
              borderRadius: "6px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = colors.closeHover)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "none")
            }
          >
            &times;
          </button>
        </div>

        {/* Subtitle */}
        <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: colors.subText, lineHeight: 1.4 }}>
            Courses parsed from your uploaded transcript. Use these to check prerequisite
            eligibility when browsing courses.
          </p>
        </div>

        {/* Course list — scrollable */}
        <div style={{ overflowY: "auto", padding: "12px 20px 20px", flex: 1 }}>
          {courses.length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {courses.map((course) => (
                <li
                  key={course}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    marginBottom: "6px",
                    borderRadius: "8px",
                    backgroundColor: colors.row,
                    fontSize: "0.95rem",
                    color: colors.rowText,
                    lineHeight: 1.5,
                    userSelect: "none",
                  }}
                >
                  <i
                    className="fa fa-check-circle"
                    style={{ color: "#5cb85c", flexShrink: 0 }}
                  />
                  {course}
                </li>
              ))}
            </ul>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                gap: "10px",
                color: colors.subText,
                textAlign: "center",
              }}
            >
              <i className="fa fa-file-o" style={{ fontSize: "2rem" }} />
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5 }}>
                No course history found.
                <br />
                Upload your unofficial transcript PDF to get started.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.85rem", color: colors.footerText }}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} found
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px",
              borderRadius: "7px",
              border: "none",
              backgroundColor: "#4a90d9",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default CourseHistoryPopup;