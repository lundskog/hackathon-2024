import { CreateGameForm } from "@/components/CreateGameForm";

export default function CreateGamePage() {
  return (
    <div className="flex flex-col gap-2 items-center w-full">
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-3xl">Create game</h1>
        <p className="font-semibold text-muted-foreground">
          Customize and create a new game of cards.
        </p>
      </div>
      <CreateGameForm />
    </div>
  );
}
