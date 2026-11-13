import React, { useState } from "react";
import { Course } from "../constants/commonTypes";

// Regex to extract course IDs (like XX.###.###)
const COURSE_ID_REGEX = /\b[a-z]{2,3}\.\d{3}\.\d{3}\b/i;

// Credit restriction patterns
const CREDIT_RESTRICTION_PATTERNS: RegExp[] = [
  /students may only receive credit for/i,
  /credit cannot be received for both/i,
  /may only receive credit for one of/i,
  /no student may receive credit for/i,
  /credit will not be granted for/i,
  /students may receive credit for only one/i,
];

// Enrollment restriction patterns
const ENROLLMENT_RESTRICTION_PATTERNS: RegExp[] = [
  /may not enroll if/i,
  /not open to students who have taken/i,
];

// Helpers to detect restrictions
const isCreditRestriction = (text: string): boolean =>
  CREDIT_RESTRICTION_PATTERNS.some((pattern) => pattern.test(text));

const isEnrollmentRestriction = (text: string): boolean =>
  ENROLLMENT_RESTRICTION_PATTERNS.some((pattern) => pattern.test(text));

// Clean a prereq string (remove restrictions, normalize spacing)
const cleanPrerequisiteString = (prerequisiteString: string): string => {
  let cleaned = prerequisiteString.toLowerCase();
  cleaned = cleaned.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();

  const parts = cleaned.split(";");

  const cleanParts = parts.filter(
    (part) => !isCreditRestriction(part) && !isEnrollmentRestriction(part)
  );

  return cleanParts.join(" ");
};

interface CheckPrerequisitesProps {
  prerequisites: Course["prerequisites"];
}

const CheckPrerequisites: React.FC<CheckPrerequisitesProps> = ({ prerequisites }) => {
  const [missingCourses, setMissingCourses] = useState<string[]>(["PLACEHOLDER"]);

  // Tokenize the prerequisite string into course codes and operators
  const tokenizePrereq = (prereqStr: string) => {
    const tokens = prereqStr.match(/\b[a-z]{2,3}\.\d{3}\.\d{3}\b|and|or|\(|\)/gi);
    return tokens ? tokens.map((t) => t.toLowerCase()) : [];
  };

  // Parse tokens into a tree for parentheses
  const parseTokens = (tokens: string[]) => {
    const parseExpression = (index: number): [any[], number] => {
      const expr: any[] = [];
      while (index < tokens.length) {
        const token = tokens[index];
        if (token === "(") {
          const [subExpr, nextIndex] = parseExpression(index + 1);
          expr.push(subExpr);
          index = nextIndex;
        } else if (token === ")") {
          return [expr, index];
        } else {
          expr.push(token);
        }
        index++;
      }
      return [expr, index];
    };
    const [tree] = parseExpression(0);
    return tree;
  };

  // Evaluate the tree against completed courses
  const evaluateTree = (tree: any, completedCourses: string[]): string[] => {
    if (typeof tree === "string") {
      return completedCourses.includes(tree) ? [] : [tree];
    }

    let missing: string[] = [];
    let i = 0;
    while (i < tree.length) {
      const token = tree[i];
      if (Array.isArray(token)) {
        missing = missing.concat(evaluateTree(token, completedCourses));
      } else if (token === "and") {
        const leftMissing = missing;
        const rightMissing = evaluateTree(tree[i + 1], completedCourses);
        missing = [...leftMissing, ...rightMissing];
        i++;
      } else if (token === "or") {
        const leftMissing = missing;
        const rightMissing = evaluateTree(tree[i + 1], completedCourses);
        if (leftMissing.length && rightMissing.length) {
          missing = [...leftMissing, ...rightMissing];
        } else {
          missing = [];
        }
        i++;
      } else if (!completedCourses.includes(token)) {
        missing.push(token);
      }
      i++;
    }
    return missing;
  };

  const handleCheck = () => {
    if (!prerequisites) return;

    const prereqLower = cleanPrerequisiteString(prerequisites);

    const matchedCourses = prereqLower.match(COURSE_ID_REGEX);
    if (!matchedCourses || matchedCourses.length === 0) {
      setMissingCourses([]);
      return;
    }

    const tokens = tokenizePrereq(prereqLower);
    const tree = parseTokens(tokens);

    const transcriptData = JSON.parse(localStorage.getItem("transcriptData") || "{}");
    const completedCourses: string[] = (transcriptData.courses || []).map((c: string) =>
      c.toLowerCase()
    );

    const missing = evaluateTree(tree, completedCourses);

    // Convert missing course codes back to uppercase, deduplicate, and filter operators
    const filteredMissing = missing
      .map((c) => c.toUpperCase())
      .filter((course, idx, arr) => arr.indexOf(course) === idx)
      .filter((course) => !["AND", "OR", "(", ")"].includes(course));

    setMissingCourses(filteredMissing.length ? filteredMissing : []);
  };

  // Prepare JSX content to avoid nested ternary
  let content;
  if (missingCourses.length === 0) {
    content = <p style={{ color: "green" }}>✅ All prerequisites satisfied</p>;
  } else if (missingCourses[0] === "PLACEHOLDER") {
    content = (
      <p style={{ color: "gray" }}>
        ⚪Check if you&apos;ve satisfied the necessary prerequisites by pressing the
        [Check] button
      </p>
    );
  } else {
    content = (
      <div>
        <p style={{ color: "red" }}>❌ Missing prerequisites:</p>
        <ul>
          {missingCourses.map((course) => (
            <li key={course}>{course}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="modal-module prerequisites">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h3 className="modal-module-header" style={{ margin: 0 }}>
          Check Satisfied Prerequisites
        </h3>
        <button onClick={handleCheck}>Check</button>
      </div>
      {content}
    </div>
  );
};

export default CheckPrerequisites;
