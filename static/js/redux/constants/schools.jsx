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

export const VALID_SCHOOLS = ["jhu"];

export const getSchoolSpecificInfo = (school) => {
  switch (school) {
    case "jhu":
      return {
        primaryDisplay: "name",
        areasName: "Areas",
        departmentsName: "Departments",
        levelsName: "Levels",
        timesName: "Times",
        courseRegex: "([A-Z]{2}\\.\\d{3}\\.\\d{3})",
        campuses: {
          1: "",
        },
        subSchoolsName: "Schools",
      };
    default:
      return {
        primaryDisplay: "code",
        areasName: "Areas",
        departmentsName: "Departments",
        levelsName: "Levels",
        timesName: "Times",
        campuses: {
          1: "",
        },
        subSchoolsName: "Schools",
      };
  }
};
