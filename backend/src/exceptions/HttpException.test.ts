import { describe, expect, it } from 'vitest'
import { BadRequestException, ConflictException, ForbiddenException, HttpException, NotFoundException, UnauthorizedException } from './HttpException'

describe('HttpException', () => {
    it('armazena status, message e content passados no construtor', () => {
        const err = new HttpException(418, 'sou um bule de chá', { teapot : true })

        expect(err.status).toBe(418)
        expect(err.message).toBe('sou um bule de chá')
        expect(err.content).toEqual({ teapot : true })
    })

    it('content é opcional e fica undefined quando não passado', () => {
        const err = new HttpException(500, 'erro interno')

        expect(err.content).toBeUndefined()
    })

    it('é uma instância de Error (mantém comportamento nativo)', () => {
        const err = new HttpException(400, 'erro qualquer')

        expect(err).toBeInstanceOf(Error)
        expect(err.stack).toBeDefined()
    })

    it('usa o nome da propria classe', () => {
        const err = new HttpException(400, 'erro qualquer')

        expect(err.name).toBe('HttpException')
    })
})

describe('subclasses de HttpException', () => {
    const cases: Array<{
        ExceptionClass: new(message: string, content?: unknown) => HttpException
        expectedStatus: number
        expectedName: string
    }> = [
        { ExceptionClass: BadRequestException, expectedStatus: 400, expectedName: "BadRequestException" },
        { ExceptionClass: UnauthorizedException, expectedStatus: 401, expectedName: "UnauthorizedException" },
        { ExceptionClass: ForbiddenException, expectedStatus: 403, expectedName: "ForbiddenException" },
        { ExceptionClass: NotFoundException, expectedStatus: 404, expectedName: "NotFoundException" },
        { ExceptionClass: ConflictException, expectedStatus: 409, expectedName: "ConflictException" },
    ]

    it.each(cases)(
        "$expectedName usa status $expectedStatus automaticamente",
        ({ ExceptionClass, expectedStatus, expectedName}) => {
            const err = new ExceptionClass('messagem de teste')

            expect(err.status).toBe(expectedStatus)
            expect(err.name).toBe(expectedName)
        }
    )

    it.each(cases)(
        "$expectedName continua sendo instanceof HttpException e instanceof Error",
        ({ ExceptionClass }) => {
            const err = new ExceptionClass('mensagem de teste')

            expect(err).toBeInstanceOf(HttpException)
            expect(err).toBeInstanceOf(Error)
        }
    )
})