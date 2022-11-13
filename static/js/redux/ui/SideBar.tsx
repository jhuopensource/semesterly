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

import React, { useState } from "react";
import classNames from "classnames";
// @ts-ignore no available type
import ClickOutHandler from "react-onclickout";
import MasterSlot from "./MasterSlot";
import TimetableNameInput from "./TimetableNameInput";
import CreditTicker from "./CreditTicker";
import { alertsActions } from "../state/slices";
import { getNextAvailableColour } from "../util";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  getActiveTimetable,
  getActiveTimetableCourses,
  getCoursesFromSlots,
  getCurrentSemester,
  getDenormCourseById,
} from "../state";
import { getCourseShareLink } from "../constants/endpoints";
import {
  addOrRemoveCourse,
  addOrRemoveOptionalCourse,
  duplicateTimetable,
  fetchCourseInfo,
  loadTimetable,
} from "../actions";
import { Timetable } from "../constants/commonTypes";
import { startComparingTimetables } from "../state/slices/compareTimetableSlice";
import AvgCourseRating from "./AvgCourseRating";
import { selectSlotColorData, selectTheme } from "../state/slices/themeSlice";
import { peerModalActions } from "../state/slices/peerModalSlice";

const SideBar = () => {
  const dispatch = useAppDispatch();
  const colorData = useAppSelector(selectSlotColorData);
  const timetable = useAppSelector(getActiveTimetable);
  const coursesInTimetable = useAppSelector((state) =>
    getCoursesFromSlots(state, timetable.slots)
  );
  const mandatoryCourses = useAppSelector((state) =>
    getCoursesFromSlots(
      state,
      timetable.slots.filter((slot) => !slot.is_optional)
    )
  );
  const optionalCourses = useAppSelector((state) =>
    state.optionalCourses.courses.map((cid) => getDenormCourseById(state, cid))
  );
  const semester = useAppSelector(getCurrentSemester);
  const savedTimetablesState = useAppSelector(
    (state) => state.userInfo.data.timetables
  );
  const courseToColourIndex = useAppSelector((state) => state.ui.courseToColourIndex);
  const courseToClassmates = useAppSelector(
    (state) => state.classmates.courseToClassmates
  );
  const avgRating = useAppSelector((state) => timetable.avg_rating);
  const activeTimetable = useAppSelector(
    (state) => state.savingTimetable.activeTimetable
  );

  const isCourseInRoster = (courseId: number) =>
    timetable.slots.some((s) => s.course === courseId);
  const getShareLink = (courseCode: string) => getCourseShareLink(courseCode, semester);

  const timetableCourses = useAppSelector((state) => getActiveTimetableCourses(state));
  const events = useAppSelector((state) => state.customEvents.events);
  const curTheme = useAppSelector(selectTheme);
  const [showDropdown, setShowDropdown] = useState(false);

  const hideDropdown = () => {
    setShowDropdown(false);
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
          <button
            onClick={(event) =>
              stopPropagation(() => dispatch(duplicateTimetable(t)), event)
            }
            className="row-button"
          >
            <i className="fa fa-clone" />
          </button>
          {!isMobile && activeTimetable.name !== t.name && (
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
          )}
        </div>
      ))
    : null;
  // TOOD: code duplication between masterslots/optionalslots
  let masterSlots = mandatoryCourses
    ? mandatoryCourses.map((course) => {
        const colourIndex =
          course.id in courseToColourIndex
            ? courseToColourIndex[course.id]
            : getNextAvailableColour(courseToColourIndex);
        const professors = course.sections.map((section) => section.instructors);
        const sectionId = timetable.slots.find(
          (slot) => slot.course === course.id
        ).section;
        return (
          <MasterSlot
            key={course.id}
            sectionId={sectionId}
            professors={professors}
            colourIndex={colourIndex}
            classmates={courseToClassmates[course.id]}
            onTimetable={isCourseInRoster(course.id)}
            course={course}
            fetchCourseInfo={() => dispatch(fetchCourseInfo(course.id))}
            removeCourse={() => dispatch(addOrRemoveCourse(course.id))}
            getShareLink={getShareLink}
            colorData={colorData}
          />
        );
      })
    : null;
  let optionalSlots = coursesInTimetable
    ? optionalCourses.map((course) => {
        const colourIndex =
          course.id in courseToColourIndex
            ? courseToColourIndex[course.id]
            : getNextAvailableColour(courseToColourIndex);
        const sectionId = course.id;
        return (
          <MasterSlot
            key={course.id}
            sectionId={sectionId}
            onTimetable={isCourseInRoster(course.id)}
            colourIndex={colourIndex}
            classmates={courseToClassmates[course.id]}
            course={course}
            fetchCourseInfo={() => dispatch(fetchCourseInfo(course.id))}
            removeCourse={() => dispatch(addOrRemoveOptionalCourse(course))}
            getShareLink={getShareLink}
            colorData={colorData}
          />
        );
      })
    : null;
  const dropItDown =
    savedTimetables && savedTimetables.length !== 0 ? (
      <div className="timetable-drop-it-down" onClick={toggleDropdown}>
        <span className={classNames("tip-down", { down: showDropdown })} />
      </div>
    ) : null;
  if (masterSlots.length === 0) {
    // @ts-ignore
    masterSlots = (
      <div className="empty-state">
        <img src="/static/img/emptystates/masterslots.png" alt="No courses added." />
        <h4>Looks like you don&#39;t have any courses yet!</h4>
        <h3>
          Your selections will appear here along with credits, professors and friends in
          the class
        </h3>
      </div>
    );
  }
  const optionalSlotsHeader =
    optionalSlots.length === 0 && masterSlots.length > 3 ? null : (
      <h4 className="sb-header">Optional Courses</h4>
    );
  if (optionalSlots.length === 0 && masterSlots.length > 3) {
    optionalSlots = null;
  } else if (optionalSlots.length === 0) {
    const img = (
      <img
        src="/static/img/emptystates/optionalslots.png"
        alt="No optional courses added."
      />
    );
    // @ts-ignore
    optionalSlots = (
      <div className="empty-state">
        {img}
        <h4>Give Optional Courses a Spin!</h4>
        <h3>
          Load this list with courses you aren&#39;t 100% sure you want to take -
          we&#39;ll fit as many as possible, automatically
        </h3>
      </div>
    );
  }
  return (
    <div className="side-bar no-print">
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
        <b>ProTip:</b> use <i className="fa fa-lock" />
        to lock a section in place.
      </h4>
      <div className="sb-master-slots">{masterSlots}</div>
      {optionalSlotsHeader}
      {optionalSlots}
      <div id="sb-optional-slots" />
    </div>
  );
};

// TODO: should be these values by default in the state
SideBar.defaultProps = {
  savedTimetables: null,
  avgRating: 0,
};

export default SideBar;
