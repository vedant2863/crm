export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    company?: string;
  };
  expires: string;
};

export type SessionContextType = {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
};
