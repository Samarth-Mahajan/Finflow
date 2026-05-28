import { UTApi } from "uploadthing/server";

export class UploadThingConfigurationError extends Error {
  readonly code = "UPLOADTHING_CONFIGURATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "UploadThingConfigurationError";
  }
}

let utapi: UTApi | null = null;

export const getUploadThingApi = (): UTApi => {
  if (utapi) {
    return utapi;
  }

  const token = process.env.UPLOADTHING_TOKEN;

  if (!token) {
    throw new UploadThingConfigurationError(
      "UPLOADTHING_TOKEN must be configured for server-side uploads.",
    );
  }

  utapi = new UTApi({ token });
  return utapi;
};
