import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/feeds/$feedId")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>One feed</h3>
    </div>
  );
}
