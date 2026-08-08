import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

const password = "Senha1234!abc";

function credentials() {
  return {
    username: `user-${randomUUID()}`,
    email: `${randomUUID()}@teste.com`,
    password,
  };
}

async function registerUser(request: any) {
  const user = credentials();
  const response = await request.post("/auth/register", { data: user });
  expect(response.status()).toBe(201);
  return user;
}

test.describe("POST /auth/login", () => {
  test("autentica usando email e retorna um JWT", async ({ request }) => {
    const user = await registerUser(request);

    const response = await request.post("/auth/login", {
      data: { identifier: user.email, password },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toMatch(/^[^.]+\.[^.]+\.[^.]+$/);
    expect(body.user).toMatchObject({
      username: user.username,
      email: user.email,
    });
    expect(body.user.password_hash).toBeUndefined();
  });

  test("autentica usando username", async ({ request }) => {
    const user = await registerUser(request);

    const response = await request.post("/auth/login", {
      data: { identifier: user.username, password },
    });

    expect(response.status()).toBe(200);
    expect((await response.json()).user.email).toBe(user.email);
  });

  test("recusa senha incorreta", async ({ request }) => {
    const user = await registerUser(request);

    const response = await request.post("/auth/login", {
      data: { identifier: user.email, password: "SenhaErrada123!" },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "credenciais inválidas" });
  });

  test("recusa username ou email inexistente", async ({ request }) => {
    const response = await request.post("/auth/login", {
      data: { identifier: "nao-existe@teste.com", password },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "credenciais inválidas" });
  });

  test("recusa corpo inválido", async ({ request }) => {
    const response = await request.post("/auth/login", { data: {} });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("dados inválidos");
    expect(Array.isArray(body.details)).toBe(true);
  });
});
