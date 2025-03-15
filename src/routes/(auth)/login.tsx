import { LoginForm } from "@/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex justify-center mt-36">
      <div className="min-w-96">
        <LoginForm />
      </div>
    </div>
  );
}
