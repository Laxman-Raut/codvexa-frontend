import React from "react";
import TopBar from "../component/TopBar";
import ActivityBar from "../component/ActivityBar";

function ProjectPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#080808]">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[200px]" />
      </div>

      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar/>
        
      </div>

    </div>
  );
}

export default ProjectPage;