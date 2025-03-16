import { login } from "@/api/auth";
import { LoginForm } from "@/components/login-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const loginMutation = useMutation({
    mutationFn: login,
  });

  const handleLoginSubmit = (data: { username: string; password: string }) => {
    loginMutation.mutate(data, {
      onSuccess: (result) => {
        console.log(result);

        const { accessToken } = result;
        localStorage.setItem("accessToken", accessToken);

        toast("Login Successful");
        navigate({ to: "/" });
      },
      onError: (error: Error) => {
        setLoginError(error.message);
        console.log(error.message || "An unexpected error occurred.");
      },
    });
  };

  return (
    <div className="flex justify-center mt-36">
      <div className="min-w-96">
        <LoginForm loginError={loginError} submitFn={handleLoginSubmit} />
      </div>
    </div>
  );
}
