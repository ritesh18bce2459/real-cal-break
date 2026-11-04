import { createFileRoute } from "@tanstack/react-router";
import { CallbreakApp } from "@/components/callbreak/CallbreakApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CallbreakApp />;
}
