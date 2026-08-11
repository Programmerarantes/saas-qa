import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

const password = "Senha1234!abc";

async function createAuthenticatedUser(request: any) {
  const user = {
    username: `user-${randomUUID()}`,
    email: `${randomUUID()}@teste.com`,
    password,
  };

  const registerResponse = await request.post("/auth/register", {
    data: user,
  });
  expect(registerResponse.status()).toBe(201);

  const loginResponse = await request.post("/auth/login", {
    data: { identifier: user.email, password },
  });
  expect(loginResponse.status()).toBe(200);

  const { token } = await loginResponse.json();
  return { user, token };
}

test.describe("GET /auth/me", () => {
  test("retorna o usuário autenticado", async ({ request }) => {
    const { user, token } = await createAuthenticatedUser(request);

    const response = await request.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      user: {
        id: expect.any(String),
        username: user.username,
        email: user.email,
      },
    });
  });

  test("recusa acesso sem autenticação", async ({ request }) => {
    const response = await request.get("/auth/me");

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "token não informado" });
  });
});

test.describe("CORS", () => {
  test("permite o frontend configurado", async ({ request }) => {
    const response = await request.get("/health", {
      headers: { Origin: "http://localhost:5173" },
    });

    expect(response.headers()["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });
});
