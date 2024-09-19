import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { handleCreateNewTimetable } from "../actions/timetable_actions";

interface CreateNewTimetableButtonProps {
  setSidebarDropdown: Function;
}

const CreateNewTimetableButton = (props: CreateNewTimetableButtonProps) => {
  const dispatch = useDispatch();
  const [hovered, toggleHovered] = useState("save-timetable add-button");

  return (
    <div
      className={classNames("create-new-timetable")}
      onClick={() => {
        dispatch(handleCreateNewTimetable());
        props.setSidebarDropdown(false);
      }}
      onMouseEnter={() => toggleHovered("save-timetable add-button-manual-hover")}
      onMouseLeave={() => toggleHovered("save-timetable add-button")}
    >
      <button className={hovered} data-tip data-for="add-btn-tooltip">
        <i className="fa fa-plus" />
      </button>
    </div>
  );
};

export default CreateNewTimetableButton;
