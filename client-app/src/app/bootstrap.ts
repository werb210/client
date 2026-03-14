export type InitialSession = {
  token: string;
};

export async function bootstrapSession(): Promise<InitialSession | null> {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const token = localStorage.getItem("client_session");

  if (!token) {
    return null;
  }

  return {
    token,
  };
}
