import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/submit")({
  component: () => <Navigate to="/list-your-property" replace />,
});
