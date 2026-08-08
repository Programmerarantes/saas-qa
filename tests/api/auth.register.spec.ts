import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

function uniqueEmail(): string {
  return `${randomUUID()}@teste.com`;
}

function uniqueUsername(): string {
  return `user-${randomUUID()}`;
}

const validPassword = "Senha1234!abc";

test.describe("POST /auth/register", () => {
  test("registra um usuário novo com sucesso (201)", async ({ request }) => {
    const email = uniqueEmail();

    const response = await request.post("/auth/register", {
      data: { username: uniqueUsername(), email, password: validPassword },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toMatchObject({ email });
    expect(body.id).toBeTruthy();
    expect(body.created_at).toBeTruthy();
    expect(body.password).toBeUndefined();
    expect(body.password_hash).toBeUndefined();
  });

  test("recusa email já cadastrado (409)", async ({ request }) => {
    const email = uniqueEmail();

    const first = await request.post("/auth/register", {
      data: { username: uniqueUsername(), email, password: validPassword },
    });
    expect(first.status()).toBe(201);

    const second = await request.post("/auth/register", {
      data: { username: uniqueUsername(), email, password: "OutraSenha123!" },
    });
    expect(second.status()).toBe(409);

    const body = await second.json();
    expect(body.error).toBe("email já cadastrado");
  });

  test("recusa corpo sem email nem senha (400)", async ({ request }) => {
    const response = await request.post("/auth/register", { data: {} });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("dados inválidos");
    expect(Array.isArray(body.details)).toBe(true);
  });

  test("recusa email em formato inválido (400)", async ({ request }) => {
    const response = await request.post("/auth/register", {
      data: {
        username: uniqueUsername(),
        email: "isso-nao-e-email",
        password: validPassword,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    const emailIssue = body.details.find((d: any) => d.field === "email");
    expect(emailIssue?.message).toBe("email inválido");
  });

  test("recusa senha com menos de 12 caracteres (400)", async ({ request }) => {
    const response = await request.post("/auth/register", {
      data: { username: uniqueUsername(), email: uniqueEmail(), password: "123" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    const passwordIssue = body.details.find((d: any) => d.field === "password");
    expect(passwordIssue?.message).toBe("senha deve ter no mínimo 12 caracteres");
  });

  test("normaliza email com espaços e maiúsculas antes de salvar", async ({
    request,
  }) => {
    const rawEmail = `  ${randomUUID()}@TESTE.COM  `;
    const expectedEmail = rawEmail.trim().toLowerCase();

    const response = await request.post("/auth/register", {
      data: { username: uniqueUsername(), email: rawEmail, password: validPassword },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.email).toBe(expectedEmail);
  });
});
