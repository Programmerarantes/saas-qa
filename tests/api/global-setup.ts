import { resetTestDb } from "./reset-test-db";

export default async function globalSetup() {
    await resetTestDb()
}