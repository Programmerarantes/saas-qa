export class HttpException extends Error {
  public readonly status: number;
  public readonly content?: unknown;

  constructor(status: number, message: string, content?: any) {
    super(message)
    this.status = status
    this.content = content

    Object.setPrototypeOf(this, new.target.prototype)

    this.name = this.constructor.name
   }
}

export class BadRequestException extends HttpException {
  constructor(message: string, content?: unknown) {
    super(400, message, content)
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = "não autorizado", content?: unknown) {
    super(401, message, content)
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "acesso negado", content?: unknown) {
    super(403, message, content)
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'recurso não encontrado', content?: unknown) {
    super(404, message, content)
  }
}

export class ConflictException extends HttpException {
  constructor(message: string, content?: unknown) {
    super(409, message, content)
  }
}