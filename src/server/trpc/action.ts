import { resolveHTTPResponse } from "@trpc/server/http";
import type { JSONObject } from "superjson/dist/types";
import type { RequestEventLoader } from "~/utils/types";
import { createContext } from "./context";
import { appRouter } from "./router/index";

export const trpcAction = async (
  form: JSONObject,
  event: RequestEventLoader
) => {
  const headers: Record<string, string> = {};
  event.request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  try {
    const res = await resolveHTTPResponse({
      createContext: () => createContext(event),
      path: form.path as string,
      req: {
        body: form.body,
        headers,
        method: "POST",
        query: new URLSearchParams(),
      },
      router: appRouter,
    });

    for (const key in res.headers) {
      const value = res.headers[key] as string;
      event.headers.set(key, value);
    }

    event.status(res.status);
    return JSON.parse(res.body as string);
  } catch (error) {
    event.status(500);
    return "Internal Server Error";
  }
};
