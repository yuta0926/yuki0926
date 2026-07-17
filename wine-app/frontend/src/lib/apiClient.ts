import { env } from "../config/env";
import { supabase } from "./supabaseClient";


type FastApiErrorResponse = {
  detail?: string;
};


export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(
    message: string,
    status: number,
    data: unknown = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}


type ApiClientOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};


async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text || null;
}


export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { body, headers, ...requestOptions } = options;

  const isFormData = body instanceof FormData;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${env.apiBaseUrl}${path}`,
    {
      ...requestOptions,

      headers: {
        Accept: "application/json",

        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),

        ...(session
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),

        ...headers,
      },

      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    },
  );

  const responseData = await parseResponseBody(response);

  if (!response.ok) {
    const errorData =
      responseData as FastApiErrorResponse | null;

    const message =
      errorData?.detail ??
      `APIリクエストに失敗しました。status=${response.status}`;

    throw new ApiError(
      message,
      response.status,
      responseData,
    );
  }

  return responseData as T;
}