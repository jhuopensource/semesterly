/*
Copyright (C) 2017 Semester.ly Technologies, LLC

Semester.ly is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Semester.ly is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import classNames from "classnames";
// @ts-ignore no available type
import ClickOutHandler from "react-onclickout";
import MasterSlot from "./MasterSlot";
import TimetableNameInput from "./TimetableNameInput";
import CreditTicker from "./CreditTicker";
import { alertsActions, AlertCoursePlanType } from "../state/slices";
import { getNextAvailableColour } from "../util";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  getActiveTimetable,
  getActiveTimetableCourses,
  getCoursesFromSlots,
  getCurrentSemester,
} from "../state";
import { getCourseShareLink } from "../constants/endpoints";
import {
  addOrRemoveCourse,
  duplicateTimetable,
  fetchCourseInfo,
  loadTimetable,
  updateCourses,
  postTranscript,
  ensureCsrfCookie,
} from "../actions";
import {
  Course,
  DenormalizedCourse,
  Section,
  Timetable,
} from "../constants/commonTypes";
import { startComparingTimetables } from "../state/slices/compareTimetableSlice";
import AvgCourseRating from "./AvgCourseRating";
import { selectSlotColorData, selectTheme } from "../state/slices/themeSlice";
import { peerModalActions } from "../state/slices/peerModalSlice";
import CreateNewTimetableButton from "./CreateNewTimetableButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import findTopSchedules, { SchedulePolicy } from "./optimize_schedule";
import CourseHistoryPopup from "./CourseHistoryPopup";

/**
 * This component displays the timetable name, allows you to switch between timetables,
 * shows credits and average course rating, contains the "Find New Friends" link to open
 * the PeerModal, and mainly displays all of the courses on the student's current
 * timetable using MasterSlots.
 */
const SideBar = () => {
  const dispatch = useAppDispatch();
  const colorData = useAppSelector(selectSlotColorData);
  const timetable = useAppSelector(getActiveTimetable);
  const mandatoryCourses: DenormalizedCourse[] = useAppSelector(
    (state) =>
      useMemo(
        () => getCoursesFromSlots(state, timetable.slots),
        [state, timetable.slots]
      ) // Only change when slots or state changes
  );
  const semester = useAppSelector(getCurrentSemester);
  const savedTimetablesState = useAppSelector(
    (state) => state.userInfo.data.timetables
  );
  const courseToColourIndex = useAppSelector((state) => state.ui.courseToColourIndex);
  const courseToClassmates = useAppSelector(
    (state) => state.classmates.courseToClassmates
  );
  const avgRating = useAppSelector(() => timetable.avg_rating);
  const activeTimetable = useAppSelector(
    (state) => state.savingTimetable.activeTimetable
  );

  const MAXIMUM_COURSE_PLAN = 15; // max number of courses allowed in course plan
  const getShareLink = (courseCode: string) => getCourseShareLink(courseCode, semester);
  const timetableCourses = useAppSelector((state) => getActiveTimetableCourses(state));
  const events = useAppSelector((state) => state.customEvents.events);
  const curTheme = useAppSelector(selectTheme);
  const [showDropdown, setShowDropdown] = useState(false);

  const [hoveredCourse, setHoveredCourse] = useState(-1);
  const [masterSlotListLength, setMasterSlotListLength] = useState(0);

  // coursePlan stores all the courses that the user drags into the course optimization section
  const [coursePlan, setCoursePlan] = useState([]);
  const [isCoursePlanDragging, setIsCoursePlanDragging] = useState(false);
  const [isMasterCourseDragging, setIsMasterCourseDragging] = useState(false);
  const [draggedCourse, setDraggedCourse] = useState(null);
  // masterSlots stores the MasterSlot components to be rendered for the original course list
  const [masterSlots, setMasterSlots] = useState([]);

  // Contains all keys for masterSlots (Iterated over for hoveredCourse, i.e. state for index of up/down keyboard shortcuts)
  const [masterSlotList, setMasterSlotList] = useState([]);

  // coursePlanMasterSlots likewise stores the MasterSlot components for the optimization section
  const [coursePlanMasterSlots, setCoursePlanMasterSlots] = useState([]);
  // masterSlotCourses stores all the courses in the course list, excluding the ones the user puts in the optimization section
  const [masterSlotCourses, setMasterSlotCourses] = useState([]);

  // attribute to check if is or isn't dark mode
  const theme = useAppSelector(selectTheme);
  const isDarkMode = theme && theme.name && theme.name === "dark";

  // state to keep track of active background color
  const [backgroundColorCourseConfig, setBackgroundColorCourseConfig] =
    useState("transparent");
  const [backgroundColorMasterCourseDragging, setBackgroundColorMasterCourseDragging] =
    useState("transparent");

  // helper to store the current selected sectionsW
  const currentSections = useMemo(
    () =>
      timetable.slots
        .map((slot) => {
          const course = mandatoryCourses.find(
            (mandatoryCourse) => mandatoryCourse.id === slot.course
          );
          if (!course) return null;

          const section = course.sections.find(
            (courseSection) => courseSection.id === slot.section
          );
          return section
            ? {
                ...section,
                is_locked: slot.is_locked,
                offerings: slot.offerings,
                course_id: course.id,
              }
            : null;
        })
        .filter((section) => section !== null),
    [timetable.slots, mandatoryCourses]
  );

  // hook that updates master slot courses
  useEffect(() => {
    createMasterSlots(
      masterSlotCourses,
      setMasterSlots,
      true,
      true,
      true,
      "masterSlotCourses"
    );
  }, [masterSlotCourses]);

  // hook that updates course plan courses
  useEffect(() => {
    createMasterSlots(
      coursePlan,
      setCoursePlanMasterSlots,
      true,
      false,
      false, // set delete button for course plan
      "coursePlan"
    );
  }, [coursePlan]);

  // hook that updates the master course and the course plan
  // TODO: simplify the logic here
  useEffect(() => {
    const updatedMasterSlotList: number[] = [];
    const updatedMasterSlotCourses: (Course | DenormalizedCourse)[] = [];
    // in case of newly added courses, also add them to master slot
    mandatoryCourses.forEach((course) => {
      if (!coursePlan.some((plannedCourse) => plannedCourse.id === course.id)) {
        updatedMasterSlotCourses.push(course);
        updatedMasterSlotList.push(course.id);
      }
    });
    setMasterSlotList(updatedMasterSlotList);
    // this was to prevent a bug that would add courses twice in master slots
    if (coursePlan.length + masterSlotCourses.length !== mandatoryCourses.length)
      setMasterSlotCourses(updatedMasterSlotCourses);

    // in case of deletion of a course, make sure it's properly deleted from course plan and master slot
    setCoursePlan((prevCoursePlan) =>
      prevCoursePlan.filter((course) =>
        mandatoryCourses.some((mandatoryCourse) => mandatoryCourse.id === course.id)
      )
    );
    setMasterSlotCourses((prevMasteSlots) =>
      prevMasteSlots.filter((course) =>
        mandatoryCourses.some((mandatoryCourse) => mandatoryCourse.id === course.id)
      )
    );
  }, [mandatoryCourses]);

  // helper function to create master slot components
  const createMasterSlots = (
    courses: DenormalizedCourse[],
    setSlots: React.Dispatch<React.SetStateAction<any>>,
    showDrag: boolean,
    showLink: boolean,
    showRemove: boolean,
    target: string
  ) => {
    const updatedMasterSlotList: number[] = [];
    const newMasterSlots = courses.map((course) => {
      // Check if the course is in mandatoryCourses
      const isMandatory = mandatoryCourses.some(
        (mandatoryCourse) => mandatoryCourse.id === course.id
      );

      if (isMandatory) {
        const colourIndex =
          course.id in courseToColourIndex
            ? courseToColourIndex[course.id]
            : getNextAvailableColour(courseToColourIndex);

        const professors = course.sections.map((section) => section.instructors);
        const sectionId = timetable.slots.find(
          (slot) => slot.course === course.id
        )?.section;

        // Add course ID to master slot list
        updatedMasterSlotList.push(course.id);

        // Return the MasterSlot component
        return (
          <MasterSlot
            key={course.id}
            sectionId={sectionId}
            professors={professors}
            colourIndex={colourIndex}
            classmates={courseToClassmates[course.id]}
            course={course}
            fetchCourseInfo={() => dispatch(fetchCourseInfo(course.id))}
            removeCourse={() => dispatch(addOrRemoveCourse(course.id))}
            getShareLink={getShareLink}
            colorData={colorData}
            isHovered={
              updatedMasterSlotList[hoveredCourse] === course.id &&
              !isMasterCourseDragging &&
              !isCoursePlanDragging
            }
            draggable={showDrag}
            onDragStart={(dragStartCourse) => handleDragStart(dragStartCourse, target)}
            onDragEnd={() => handleDragEnd(target)}
            showLink={showLink}
            hideCloseButton={!showRemove}
          />
        );
      }

      // Return null if the course is not mandatory
      return null;
    });

    // Filter out null values before updating slots
    setSlots(newMasterSlots.filter((slot) => slot !== null));
  };

  const hideDropdown = () => {
    setShowDropdown(false);
    // * Set hoveredCourse to -1 if user clicks out
    setHoveredCourse(-1);
  };

  const toggleDropdown = () => {
    setShowDropdown((old) => !old);
  };

  const stopPropagation = (callback: Function, event: React.MouseEvent) => {
    event.stopPropagation();
    hideDropdown();
    callback();
  };

  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const isMobile = mobile && window.innerWidth < 767 && isPortrait;

  const savedTimetables = savedTimetablesState
    ? savedTimetablesState.map((t: Timetable) => (
        <div className="tt-name" key={t.id} onClick={() => dispatch(loadTimetable(t))}>
          {t.name}
          <Tooltip
            title={<Typography fontSize={12}>Delete</Typography>}
            disableInteractive
          >
            <button
              onClick={(event) =>
                stopPropagation(
                  () => dispatch(alertsActions.alertDeleteTimetable(t)),
                  event
                )
              }
              className="row-button"
            >
              <i className="fa fa-trash-o" />
            </button>
          </Tooltip>

          <Tooltip
            title={<Typography fontSize={12}>Duplicate</Typography>}
            disableInteractive
          >
            <button
              onClick={(event) =>
                stopPropagation(() => dispatch(duplicateTimetable(t)), event)
              }
              className="row-button"
            >
              <i className="fa fa-clone" />
            </button>
          </Tooltip>

          {!isMobile && activeTimetable.name !== t.name && (
            <Tooltip
              title={<Typography fontSize={12}>Compare</Typography>}
              disableInteractive
            >
              <button
                onClick={(event) => {
                  dispatch(
                    startComparingTimetables({
                      activeTimetable,
                      comparedTimetable: t,
                      theme: curTheme,
                    })
                  );
                  event.stopPropagation();
                }}
                className="row-button"
              >
                <i className="fa-solid fa-arrows-left-right" />
              </button>
            </Tooltip>
          )}
        </div>
      ))
    : null;

  // This detects changes to the size of masterSlotList (i.e. how many courses are on the current timetable) and updates the masterSlotList length accordingly
  // Also handles edge case in which hoveredCourse points to the last index in masterSlotList, but a course is deleted by the user. When this happens, hoveredCourse is decremented.
  useEffect(() => {
    if (
      masterSlotList.length < masterSlotListLength &&
      hoveredCourse === masterSlotListLength - 1
    ) {
      // i.e. a course was removed and last course was hovered
      setHoveredCourse((prevIndex) => prevIndex - 1);
    }
    setMasterSlotListLength(masterSlotList.length);
  }, [masterSlotList]);

  // Handles keypresses: "Up" decrements hoveredCourse, "Down" increments hoveredCourse (both with bounds).
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        if (hoveredCourse > -1) {
          setHoveredCourse((prevHoveredCourse) => prevHoveredCourse - 1);
        }
      } else if (e.key === "ArrowDown") {
        if (hoveredCourse < masterSlotListLength - 1) {
          setHoveredCourse((prevHoveredCourse) => prevHoveredCourse + 1);
        }
      } else if (e.key === "Enter" && hoveredCourse > -1) {
        dispatch(fetchCourseInfo(masterSlotList[hoveredCourse]));
      } else if (e.key === "Backspace" && hoveredCourse > -1) {
        dispatch(addOrRemoveCourse(masterSlotList[hoveredCourse]));
      }
    },
    [hoveredCourse, masterSlotListLength]
  );

  // Attaches/unattaches event listener to document
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const dropItDown =
    savedTimetables && savedTimetables.length !== 0 ? (
      <div className="timetable-drop-it-down" onClick={toggleDropdown}>
        <span className={classNames("tip-down", { down: showDropdown })} />
      </div>
    ) : null;

  // Function to handle course drag
  const handleDragStart = (course: Course | DenormalizedCourse, target: string) => {
    setDraggedCourse(course);
    if (target === "coursePlan") setIsCoursePlanDragging(true);
    else if (target === "masterSlotCourses") setIsMasterCourseDragging(true);
  };

  const handleDragEnd = (target: string) => {
    if (target === "coursePlan") setIsCoursePlanDragging(false);
    else if (target === "masterSlotCourses") setIsMasterCourseDragging(false);
  };

  // Function to handle dropping the course into the schedule
  const handleDrop = (event: React.DragEvent<HTMLDivElement>, target: string) => {
    event.preventDefault();

    // no course being dragged
    if (!draggedCourse) return;

    // Check the target drop area
    if (target === "coursePlan" && isMasterCourseDragging) {
      // Add the dragged course to the course plan
      setCoursePlan((prevPlan) => [...prevPlan, draggedCourse]);
      // Remove the dragged course from the other list
      const updatedCourses = masterSlotCourses.filter(
        (course) => course.id !== draggedCourse.id
      );
      setMasterSlotCourses(updatedCourses);
      setIsMasterCourseDragging(false);
    } else if (target === "masterSlotCourses" && isCoursePlanDragging) {
      // Add the dragged course to masterSlotCourses
      setMasterSlotCourses((prevCourses) => [...prevCourses, draggedCourse]);
      // Remove the dragged course from the other list
      const updatedCourses = coursePlan.filter(
        (course) => course.id !== draggedCourse.id
      );
      setCoursePlan(updatedCourses);
      setIsCoursePlanDragging(false);
    }

    // Reset dragged course
    setDraggedCourse(null);
  };

  // Prevent default behavior when dragging over the drop zone
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const emptyMasterSlot = () => (
    <div className="empty-state">
      <img
        src={
          curTheme.name === "light"
            ? "/static/img/emptystates/masterslots.png"
            : "/static/img/emptystates/masterslots-dark.png"
        }
        alt="No courses added."
      />
      <h4>Looks like you don&#39;t have any courses yet!</h4>
      <h3>
        Your selections will appear here along with credits, professors and friends in
        the class
      </h3>
    </div>
  );

  const addCourseIDToCourseList = (
    courses: DenormalizedCourse[]
  ): DenormalizedCourse[] =>
    courses.map((course) => ({
      ...course,
      sections: course.sections.map((section: Section) => ({
        ...section,
        course_id: course.id,
      })),
    }));

  const handleCreateClick = () => {
    if (coursePlan.length === 0 || coursePlan.length > MAXIMUM_COURSE_PLAN) {
      const alertType =
        coursePlan.length === 0
          ? AlertCoursePlanType.EMPTY
          : AlertCoursePlanType.EXCEEDS_LIMIT;
      dispatch(alertsActions.alertCoursePlan({ alertType }));
      return;
    }
    const updatedCoursePlan = addCourseIDToCourseList(coursePlan);

    const lockedSections = currentSections.filter((section) =>
      masterSlotCourses.some((course) => course.id === section.course_id)
    );

    const policy = isChecked
      ? SchedulePolicy.MINIMAL_EARLY_CLASSES
      : SchedulePolicy.MINIMAL_GAPS;
    const schedules = findTopSchedules(updatedCoursePlan, lockedSections, policy);

    if (schedules.length === 0) {
      dispatch(
        alertsActions.alertCoursePlan({
          alertType: AlertCoursePlanType.NO_FEASIBLE_SCHEDULE,
        })
      );
      return;
    }

    dispatch(updateCourses(schedules[0].schedule));
    setCoursePlan([]);
  };

  const handleAddAllClick = () => {
    setCoursePlan(mandatoryCourses);
    setMasterSlotCourses([]);
  };

  const handleRemoveAllClick = () => {
    setMasterSlotCourses(mandatoryCourses);
    setCoursePlan([]);
  };

  useEffect(() => {
    ensureCsrfCookie()
      .then(() => {})
      .catch((err: Error) => {});
  }, []);

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";

    input.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const result = await dispatch(postTranscript(formData));
        // console.log("Transcript upload success:", result);
        if (result?.courses) {
          localStorage.setItem(
            "transcriptData",
            JSON.stringify({
              courses: result.courses,
            })
          );
          // console.log("Transcript successfully saved to localStorage");
        }
      } catch (error) {
        // console.error("Upload failed:", error);
        dispatch(alertsActions.alertUploadFailed());
      }
    });

    input.click();
  };

  const [showCourseHistory, setShowCourseHistory] = useState(false);

  const handleCheckClick = (): void => {
    setShowCourseHistory(!showCourseHistory);
  };

  const handleClearClick = (): void => {
    localStorage.removeItem("transcriptData");
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    setIsChecked((prev) => !prev); // Toggle the state
  };

  useEffect(() => {
    if (isCoursePlanDragging) {
      setBackgroundColorCourseConfig(isDarkMode ? "#3F4246" : "lightblue");
    } else {
      setBackgroundColorCourseConfig("transparent");
    }
  }, [isCoursePlanDragging, isDarkMode]);

  useEffect(() => {
    if (isMasterCourseDragging) {
      setBackgroundColorMasterCourseDragging(isDarkMode ? "#3F4246" : "lightblue");
    } else {
      setBackgroundColorMasterCourseDragging("transparent");
    }
  }, [isMasterCourseDragging, isDarkMode]);

  const masterSlotsColumn = (masterSlotsLen: number, coursePlanLen: number) => {
    if (masterSlotsLen === 0 && coursePlanLen === 0) {
      return emptyMasterSlot();
    }

    if (masterSlotsLen === 0) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <p
            style={{
              lineHeight: "1.5",
              textAlign: "center",
              userSelect: "none",
            }}
          >
            Drag courses back here to lock in your section choice!
          </p>
          <button onClick={handleRemoveAllClick}>Remove All</button>
        </div>
      );
    }

    return masterSlots;
  };

  return (
    <div className="side-bar no-print overflow-y-auto overflow-x-hidden">
      <div className="sb-name">
        <TimetableNameInput />
        <ClickOutHandler onClickOut={hideDropdown}>
          {dropItDown}
          <div
            className={classNames("timetable-names-dropdown", {
              down: showDropdown,
            })}
          >
            <div className="tip-border" />
            <div className="tip" />

            <h4>{`${semester.name} ${semester.year}`}</h4>

            {savedTimetables}
            <CreateNewTimetableButton setSidebarDropdown={setShowDropdown} />
          </div>
        </ClickOutHandler>
      </div>
      <div className="col-1-3" style={{ textAlign: "center" }}>
        <CreditTicker timetableCourses={timetableCourses} events={events} />
      </div>
      <div className="col-2-3">
        <AvgCourseRating avgRating={avgRating} />
      </div>
      <a onClick={() => dispatch(peerModalActions.togglePeerModal())}>
        <h4 className="sb-header">
          Current Courses
          <div className="sb-header-link">
            <i className="fa fa-users" />
            &nbsp;Find new friends
          </div>
        </h4>
      </a>
      <h4 className="sb-tip">
        <b>ProTip:</b> use <i className="fa fa-lock" /> to lock a section in place.
      </h4>
      <div
        className="sb-master-slots"
        onDrop={(event) => handleDrop(event, "masterSlotCourses")}
        onDragEnd={() => handleDragEnd("masterSlotCourses")}
        onDragOver={handleDragOver}
        style={{
          backgroundColor: backgroundColorCourseConfig,
          transition: "background-color 0.3s ease",
          borderBottom: "2px solid black",
          minHeight: "200px",
          padding: masterSlots.length === 0 && coursePlan.length === 0 ? "2px" : "8px",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        {masterSlotsColumn(masterSlots.length, coursePlan.length)}
      </div>
      <div
        className="sb-course-scheduling"
        style={{
          marginTop: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ width: "60%" }}>Course History</h5>
          <div
            style={{
              height: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                height: "40px",
                display: "flex",
                flexDirection: "row",
                gap: "5px",
                justifyContent: "center",
              }}
            >
              <button onClick={handleUploadClick}>Upload</button>
              <button onClick={handleClearClick}>Clear</button>
            </div>
            <button onClick={handleCheckClick}>
              {showCourseHistory ? "Hide" : "View"}
            </button>
          </div>
        </div>
        {showCourseHistory && (
          <CourseHistoryPopup onClose={() => setShowCourseHistory(false)} />
        )}
        <div>
          <p
            style={{
              marginTop: "5px",
              lineHeight: "1.5",
              userSelect: "none",
              fontSize: "small",
              color: curTheme.name === "dark" ? "#A0A0A0" : "#555",
            }}
          >
            Upload your unofficial transcript (PDF) to update your course history. 
             When searching for courses, you can instantly check if you've met the prerequisites.
          </p>
        </div>
        <div
          style={{
            marginTop: "10px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ width: "60%" }}>Scheduled Courses</h5>
          <div
            style={{
              height: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              justifyContent: "center",
            }}
          >
            <button onClick={handleCreateClick}>Create</button>
            <button onClick={handleAddAllClick}>Add All</button>
          </div>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <input
            type="checkbox"
            id="toggle-radio"
            checked={isChecked} // Bound to state
            onChange={handleToggle} // Handles the toggle
            className="cursor-pointer"
            style={{
              width: "fit-content",
              padding: "4px",
              marginRight: "4px",
            }}
          />
          <label
            htmlFor="toggle-radio"
            className="cursor-pointer select-none"
            style={{ userSelect: "none" }}
          >
            Avoid Morning Class
          </label>
        </div>

        <div
          onDrop={(event) => handleDrop(event, "coursePlan")}
          onDragEnd={() => handleDragEnd("coursePlan")}
          onDragOver={handleDragOver}
          style={{
            minHeight: "200px",
            padding: "8px",
            backgroundColor: backgroundColorMasterCourseDragging,
            transition: "background-color 0.3s ease",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {coursePlan.length > 0 ? (
            coursePlanMasterSlots
          ) : (
            <p
              style={{
                lineHeight: "1.5",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              Drag and drop courses to automatically make your schedule!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

SideBar.defaultProps = {
  savedTimetables: null,
  avgRating: 0,
};

export default SideBar;
