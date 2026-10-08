import React from "react";

import { HALF_HOUR_HEIGHT } from "../constants/constants";

type GhostSlotProps = {
  id: string;
  color: string;
  borderColor: string;
  text: string;
  section: string;
  location: string;
  time_start: string;
  time_end: string;
  num_conflicts: number;
  shift_index: number;
  depth_level: number;
  uses12HrTime: boolean;
};

const GhostSlot = (props: GhostSlotProps) => {
  const formatDisplayTime = (time: string) => {
    if (!props.uses12HrTime) {
      return time;
    }
    const [hourRaw, minute] = time.split(":");
    const hour = parseInt(hourRaw, 10);
    if (hour > 12) {
      return `${hour - 12}:${minute}`;
    }
    return time;
  };
  const startHour = parseInt(props.time_start.split(":")[0], 10);
  const startMinute = parseInt(props.time_start.split(":")[1], 10);
  const endHour = parseInt(props.time_end.split(":")[0], 10);
  const endMinute = parseInt(props.time_end.split(":")[1], 10);

  const top =
    startHour * (HALF_HOUR_HEIGHT * 2 + 2) + startMinute * (HALF_HOUR_HEIGHT / 30);
  const bottom =
    endHour * (HALF_HOUR_HEIGHT * 2 + 2) + endMinute * (HALF_HOUR_HEIGHT / 30) - 1;
  const totalSlotWidth = 100 - 7 * props.depth_level;
  const slotWidthPercentage = totalSlotWidth / props.num_conflicts;
  const pushLeft = props.shift_index * slotWidthPercentage + 7 * props.depth_level;

  return (
    <div className="fc-event-container" style={{ pointerEvents: "none" }}>
      <div
        className="fc-time-grid-event fc-event slot ghost-slot"
        id={props.id}
        style={{
          top,
          bottom: -bottom,
          right: "0%",
          width: `${slotWidthPercentage}%`,
          left: `${pushLeft}%`,
          zIndex: 1,
          opacity: 0.45,
          backgroundColor: props.color,
          border: `1px dashed ${props.borderColor}`,
          color: "#111827",
          boxShadow: "none",
        }}
      >
        <div className="fc-content">
          <div className="fc-time">
            <span className="fc-time-name">{props.text}</span>
          </div>
          <div className="fc-time">
            <span>
              {props.section}
              {props.section ? " " : ""}
              {formatDisplayTime(props.time_start)} - {formatDisplayTime(props.time_end)}
            </span>
          </div>
          <div className="fc-time">
            <span>{props.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostSlot;
