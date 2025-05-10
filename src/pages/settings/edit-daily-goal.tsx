import type { NextPage } from "next";
import React from "react";
import { TopBar } from "~/components/TopBar";
import { LeftBar } from "~/components/LeftBar";
import { BottomBar } from "~/components/BottomBar";
import { SettingsRightNav } from "~/components/SettingsRightNav";
import DailyGoalEditor from "~/components/DailyGoalEditor";

const EditDailyGoal: NextPage = () => {
  return (
    <div>
      <TopBar />
      <LeftBar selectedTab={undefined} />
      <BottomBar selectedTab={undefined} />

      <div className="mx-auto flex flex-col gap-5 px-4 py-20 sm:py-10 md:pl-28 lg:pl-72">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between lg:max-w-4xl">
          <h1 className="text-lg font-bold text-gray-800 sm:text-2xl">Edit Daily Goal</h1>
        </div>

        <div className="flex justify-center gap-12">
          <div className="flex w-full max-w-xl flex-col gap-8">
            <DailyGoalEditor />
          </div>

          <SettingsRightNav selectedTab="Edit Daily Goal" />
        </div>
      </div>
    </div>
  );
};

export default EditDailyGoal;
