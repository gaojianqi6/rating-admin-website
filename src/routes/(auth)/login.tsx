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

  const onSubmit = (data: { username: string; password: string }) => {
    toast("Success");
    loginMutation.mutate(data, {
      onSuccess: (result) => {
        console.log(result);

        const { access_token, token_type } = result;
        localStorage.setItem("accessToken", access_token);

        navigate({ to: "/" });
      },
      onError: (error: any) => {
        // Set a global error message if the API returns an error.
        console.log(error.message || "An unexpected error occurred.");
      },
    });
  };

  return (
    <div className="flex justify-center mt-36">
      <div className="min-w-96">
        <LoginForm loginError={loginError} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
