import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/favorite")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Favorite</h3>
    </div>
  );
}
