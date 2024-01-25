import { NewRoutineForm } from "@/components/NewRoutineForm";

export default function NewRoutinePage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">New Routine</h1>
      <NewRoutineForm />
    </div>
  );
}
