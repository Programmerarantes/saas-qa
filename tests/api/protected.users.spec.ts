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
  return token;
}

test.describe("GET /users", () => {
  test("recusa acesso sem token", async ({ request }) => {
    const response = await request.get("/users");

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "token não informado" });
  });

  test("recusa token inválido", async ({ request }) => {
    const response = await request.get("/users", {
      headers: { Authorization: "Bearer token-invalido" },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "token inválido" });
  });

  test("permite acesso com token válido", async ({ request }) => {
    const token = await createAuthenticatedUser(request);

    const response = await request.get("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });
});
