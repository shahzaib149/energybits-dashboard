export class CairrotAPIError extends Error {
  readonly status: number;
  readonly path: string;
  readonly code?: string;

  constructor(message: string, status: number, path: string, code?: string) {
    super(message);
    this.name = "CairrotAPIError";
    this.status = status;
    this.path = path;
    this.code = code;
  }
}

export class CairrotNotFoundError extends CairrotAPIError {
  constructor(message: string, path: string) {
    super(message, 404, path, "NOT_FOUND");
    this.name = "CairrotNotFoundError";
  }
}

export class CairrotConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CairrotConfigError";
  }
}
