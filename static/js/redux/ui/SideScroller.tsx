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

interface SideScrollerProps {
  content: JSX.Element[];
  navItems: JSX.Element[];
}

function SideScroller(props: SideScrollerProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  let navItems = null;
  if (props.navItems) {
    const navs = [];

    for (let i = 0; i < props.navItems.length; i++) {
      const cls = activeSlide === i ? " nav-item-active" : "";
      navs.push(
        <span key={i} className={`nav-item${cls}`} onClick={() => setActiveSlide(i)}>
          {props.navItems[i]}
        </span>
      );
    }
    navItems = <div className="scroll-nav">{navs}</div>;
  }
  return (
    <div>
      {navItems}
      {props.content[activeSlide]}
    </div>
  );
}

export default SideScroller;
