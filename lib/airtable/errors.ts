export class AirtableAPIError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = "AirtableAPIError";
    this.status = status;
    this.path = path;
  }
}

export class AirtableConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AirtableConfigError";
  }
}
