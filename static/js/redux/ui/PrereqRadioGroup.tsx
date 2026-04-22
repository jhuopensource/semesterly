import React from "react";
import { selectTheme } from "../state/slices/themeSlice";
import { useAppSelector } from "../hooks";
import { PrereqModeStatus } from "../constants/commonTypes";

const prereqModeStatusToButtonName = (status: PrereqModeStatus) => {
  const mapping: Record<PrereqModeStatus, string> = {
    [PrereqModeStatus.ORIGINAL]: "Original",
    [PrereqModeStatus.NAME]: "Name",
    [PrereqModeStatus.CODE]: "Code",
  };
  return mapping[status];
};

interface PrereqRadioGroupProps {
  active: PrereqModeStatus;
  onChange: (mode: PrereqModeStatus) => void;
}

const PrereqRadioGroup: React.FC<PrereqRadioGroupProps> = ({ active, onChange }) => {
  const curTheme = useAppSelector(selectTheme);

  return (
    <div className={["prerequisites-radio-group", curTheme.name].join(" ")}>
      {[PrereqModeStatus.ORIGINAL, PrereqModeStatus.NAME, PrereqModeStatus.CODE].map(
        (button: PrereqModeStatus) => (
          <div
            key={button}
            onClick={() => onChange(button)}
            className={[
              "prerequisites-radio-btn",
              active === button && "active",
              curTheme.name,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {prereqModeStatusToButtonName(button)}
          </div>
        )
      )}
    </div>
  );
};

export default PrereqRadioGroup;
