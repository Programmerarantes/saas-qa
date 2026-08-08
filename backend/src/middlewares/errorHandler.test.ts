import { describe, expect, it, vi } from 'vitest'
import { Response } from "express"
import { errorHandler } from "./errorHandler";
import { BadRequestException, ConflictException } from "../exceptions/HttpException";

//objeto 'res' falso que se comporta como Express
function createMockResponse() {
    const res = {} as Response
    res.status = vi.fn().mockReturnValue(res)
    res.json = vi.fn().mockReturnValue(res)

    return res
}

describe('errorHandler', () => {
    it('response com o status e mensagem de uma HttpException', () => {
        const res = createMockResponse()
        const err = new ConflictException('email já cadastrado')

        errorHandler(err, {} as any, res, vi.fn())

        expect(res.status).toHaveBeenCalledWith(409)
        expect(res.json).toHaveBeenCalledWith({ error : 'email já cadastrado'})
    })

    it('inclui details na resposta quando a exception tem content', () => {
        const res = createMockResponse()
        const err = new BadRequestException('dados inválidos', {
            error: 'dados inválidos',
            details: { field: 'email' }
        })
    })

    it('não inclui details quando a excpetion não tem content', () => {
        const res = createMockResponse()
        const err = new ConflictException('email já cadastrado')

        errorHandler(err, {} as any, res, vi.fn())

        const responseBody = (res.json as any).mock.calls[0][0]
        expect(responseBody).not.toHaveProperty("details")
    })

    it("trata erro desconhecido (não HttpException) como 500 genérico", () => {
    const res = createMockResponse()
    const err = new Error("algo inesperado explodiu")

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    errorHandler(err, {} as any, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: "erro interno" })

    consoleSpy.mockRestore()
  });

   it("nunca vaza a mensagem original de um erro desconhecido pro cliente", () => {
    const res = createMockResponse()
    const err = new Error("connection string com senha do banco exposta")
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    errorHandler(err, {} as any, res, vi.fn())

    const responseBody = (res.json as any).mock.calls[0][0]
    expect(responseBody.error).toBe("erro interno")
    expect(JSON.stringify(responseBody)).not.toContain("connection string")

    consoleSpy.mockRestore()
  })
})