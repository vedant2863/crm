import { signIn } from "next-auth/react";

export function registerUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  return fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });
}

export function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return signIn("credentials", {
    email,
    password,
  });
}
