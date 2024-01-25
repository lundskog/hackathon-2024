"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { Edit2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Day } from "@/lib/utils";
import Link from "next/link";

interface IObjective {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  timeValue: TimeRange | string;
  daysOfWeek: number; // Updated to use number
}

type TimeRange = [string, string];

interface IDateRange {
  fromDate: Date;
  toDate: Date;
}
interface IRoutine {
  id: string;
  title: string;
  description?: string;
  objectives: IObjective[];
  dateRange?: IDateRange;
  daysOfWeek?: number;
  active: boolean;
}

const exampleRoutine1: IRoutine = {
  id: "a",
  title: "Zen Mode",
  objectives: [
    {
      id: "def",
      isCompleted: false,
      title: "Vakna",
      timeValue: "06:30",
      daysOfWeek:
        Day.Monday | Day.Tuesday | Day.Wednesday | Day.Thursday | Day.Friday,
    },
    {
      id: "abc",
      isCompleted: false,
      title: "Gym",
      timeValue: "12:00",
      daysOfWeek:
        Day.Monday |
        Day.Tuesday |
        Day.Wednesday |
        Day.Thursday |
        Day.Friday |
        Day.Saturday,
    },
    {
      id: "def",
      isCompleted: false,
      title: "Springa",
      timeValue: "12:30",
      daysOfWeek: Day.Saturday | Day.Sunday,
    },
    {
      id: "def",
      isCompleted: false,
      title: "Tvätta",
      timeValue: "16:30",
      daysOfWeek: Day.Saturday | Day.Sunday,
    },
  ],
  daysOfWeek:
    Day.Monday |
    Day.Tuesday |
    Day.Wednesday |
    Day.Thursday |
    Day.Friday |
    Day.Saturday,
  active: true,
};

const exampleRoutine2: IRoutine = {
  id: "a",
  title: "Februari 2024",
  objectives: [
    {
      id: "def",
      isCompleted: false,
      title: "Vakna",
      timeValue: "06:30",
      daysOfWeek:
        Day.Monday |
        Day.Tuesday |
        Day.Wednesday |
        Day.Thursday |
        Day.Friday |
        Day.Saturday |
        Day.Sunday,
    },
    {
      id: "abcd",
      isCompleted: false,
      title: "Kalldusch",
      timeValue: "07:00",
      daysOfWeek:
        Day.Monday |
        Day.Tuesday |
        Day.Wednesday |
        Day.Thursday |
        Day.Friday |
        Day.Saturday |
        Day.Sunday,
    },
    {
      id: "abc",
      isCompleted: false,
      title: "Gym",
      timeValue: "12:00",
      daysOfWeek:
        Day.Monday |
        Day.Tuesday |
        Day.Wednesday |
        Day.Thursday |
        Day.Friday |
        Day.Saturday,
    },
  ],
  daysOfWeek:
    Day.Monday |
    Day.Tuesday |
    Day.Wednesday |
    Day.Thursday |
    Day.Friday |
    Day.Saturday |
    Day.Sunday,
  active: false,
};

const routines: IRoutine[] = [exampleRoutine1, exampleRoutine2];

const activeRoutines = routines.filter((routine) => routine.active);
const inactiveRoutines = routines.filter((routine) => !routine.active);

export default function RoutinesPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Routines</h1>
      <TopButtons />
      <MappedRoutines />
    </div>
  );

  function TopButtons() {
    return (
      <div className="flex gap-1">
        <AddRoutineButton />
        <EditRoutineButton />
      </div>
    );
  }

  function AddRoutineButton() {
    return (
      <Link href={"/routines/new"}>
        <Button className="flex gap-1">
          <Plus size={16} /> <div>New</div>
        </Button>
      </Link>
    );
  }

  function EditRoutineButton() {
    return (
      <Button variant="outline" className="flex gap-1">
        <Edit2 size={16} /> <div>Edit</div>
      </Button>
    );
  }
  function Routine(routine: IRoutine) {
    return (
      <Card className="p-4 flex flex-col gap-2 w-96">
        <div className="leading-4">
          <h1 className="font-semibold">{routine.title}</h1>
          <div className="font-medium text-muted-foreground text-xs">
            {routine.active ? (
              <div className="relative flex items-center gap-1">
                <div className="bg-emerald-500 relative rounded-full w-1 h-1" />
                Active
              </div>
            ) : (
              <div className="relative flex items-center gap-1">
                <div className="bg-rose-500 relative rounded-full w-1 h-1" />
                Inactive
              </div>
            )}
          </div>
        </div>
        <Separator />
        <div className="flex gap-2">shush</div>
        <div className="w-full flex justify-between">
          <div></div>
          <Button size={"sm"}>Open</Button>
        </div>
      </Card>
    );
  }

  function MappedRoutines() {
    return (
      <div className="flex flex-col gap-4 flex-wrap pt-2">
        <div className="flex flex-col flex-wrap gap-2">
          <h1 className="font-semibold">Active</h1>
          {activeRoutines.map((routine) => {
            return <Routine key={routine.id} {...routine} />;
          })}
        </div>
        <div className="flex flex-col flex-wrap gap-2">
          <h1 className="font-semibold">Scheduled for Feb 1, 2024</h1>
          {inactiveRoutines.map((routine) => {
            return <Routine key={routine.id} {...routine} />;
          })}
        </div>
      </div>
    );
  }
}
