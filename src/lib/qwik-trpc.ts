/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @see https://trpc.io/blog/tinyrpc-client
 */
import { implicit$FirstArg, type QRL } from "@builder.io/qwik";
import {
  globalAction$,
  routeAction$,
  type Action,
  type RequestEvent,
  type RequestEventCommon,
  type RequestEventLoader,
} from "@builder.io/qwik-city";
import { isServer } from "@builder.io/qwik/build";
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  inferProcedureInput,
  inferProcedureOutput,
  ProcedureRouterRecord,
  TRPCError,
} from "@trpc/server";
import type { ZodIssue } from "zod";

type ProxyCallbackOptions = {
  path: string[];
  args: unknown[];
};

type ProxyCallback = (opts: ProxyCallbackOptions) => unknown;

type TrpcProcedureOutput<TProcedure extends AnyProcedure> =
  | {
      result: inferProcedureOutput<TProcedure>;
      status: "success";
    }
  | {
      code: ZodIssue["code"];
      status: "error";
      issues: ZodIssue[];
    };

type DecorateProcedure<TProcedure extends AnyProcedure> =
  TProcedure extends AnyQueryProcedure
    ? {
        loader: (
          event: RequestEventLoader,
          input: inferProcedureInput<TProcedure>
        ) => TrpcProcedureOutput<TProcedure>;
        query: () => (
          input: inferProcedureInput<TProcedure>
        ) => Promise<TrpcProcedureOutput<TProcedure>>;
      }
    : TProcedure extends AnyMutationProcedure
    ? {
        globalAction$: () => Action<
          TrpcProcedureOutput<TProcedure>,
          inferProcedureInput<TProcedure>,
          false
        >;
        routeAction$: () => Action<
          TrpcProcedureOutput<TProcedure>,
          inferProcedureInput<TProcedure>,
          false
        >;
        mutate: () => (
          input: inferProcedureInput<TProcedure>
        ) => Promise<TrpcProcedureOutput<TProcedure>>;
      }
    : never;

type DecoratedProcedureRecord<TProcedures extends ProcedureRouterRecord> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? DecoratedProcedureRecord<TProcedures[TKey]["_def"]["record"]>
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey]>
    : never;
};

type TrpcCaller<TRouter extends AnyRouter> = ReturnType<
  TRouter["createCaller"]
>;

type TrpcCallerOptions = {
  prefix: string;
};

type TrpcResolver<TRouter extends AnyRouter> = {
  dotPath: string[];
  callerQrl: QRL<(event: RequestEventCommon) => Promise<TrpcCaller<TRouter>>>;
};

export const trpcResolver = async <TRouter extends AnyRouter>(
  caller: TrpcCaller<TRouter>,
  dotPath: string[],
  args: any
) => {
  const fnc = dotPath.reduce((prev, curr) => prev[curr], caller as any);

  const safeParse = (data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  try {
    const result = await fnc(args);

    return { result, status: "success" };
  } catch (err) {
    const trpcError = err as TRPCError;
    const error = {
      code: trpcError.code,
      issues: safeParse(trpcError.message),
      status: "error",
    };
    return error;
  }
};

export const trpcGlobalActionResolverQrl = <TRouter extends AnyRouter>(
  contextQrl: QRL<() => TrpcResolver<TRouter>>,
  dotPath: string[]
) => {
  // eslint-disable-next-line qwik/loader-location
  return globalAction$(
    async (args, event) => {
      const context = await contextQrl();
      const caller = await context.callerQrl(event);
      return trpcResolver(caller, dotPath, args);
    },
    { id: dotPath.join(".") }
  );
};

export const trpcGlobalActionResolver$ = /*#__PURE__*/ implicit$FirstArg(
  trpcGlobalActionResolverQrl
);

export const trpcRouteActionResolverQrl = <TRouter extends AnyRouter>(
  contextQrl: QRL<() => TrpcResolver<TRouter>>,
  dotPath: string[]
) => {
  // eslint-disable-next-line qwik/loader-location
  return routeAction$(
    async (args, event) => {
      const context = await contextQrl();
      const caller = await context.callerQrl(event);
      return trpcResolver(caller, dotPath, args);
    },
    { id: dotPath.join(".") }
  );
};

export const trpcRouteActionResolver$ = /*#__PURE__*/ implicit$FirstArg(
  trpcRouteActionResolverQrl
);

export const serverTrpcQrl = <TRouter extends AnyRouter>(
  callerQrl: QRL<(event: RequestEventCommon) => Promise<TrpcCaller<TRouter>>>,
  options: TrpcCallerOptions
) => {
  const createRecursiveProxy = (callback: ProxyCallback, path: string[]) => {
    const proxy: unknown = new Proxy(() => void 0, {
      apply(_1, _2, args) {
        return callback({ args, path });
      },
      get(_obj, key) {
        if (typeof key !== "string") {
          return undefined;
        }
        return createRecursiveProxy(callback, [...path, key]);
      },
    });

    return proxy;
  };

  return {
    onRequest: async (event: RequestEvent) => {
      const prefixPath = `${options.prefix}/`;
      const pathname = event.url.pathname;
      if (
        isServer &&
        pathname.startsWith(prefixPath) &&
        event.method === "POST"
      ) {
        const [, trpcPath] = pathname.split(prefixPath);
        const dotPath = trpcPath.split(".");
        const args = await event.request.json();
        const caller = await callerQrl(event);

        const result = await trpcResolver(caller, dotPath, args);

        event.json(200, result);
      }
    },
    trpc: createRecursiveProxy((opts) => {
      const dotPath = opts.path.slice(0, -1);
      const action = opts.path[opts.path.length - 1];

      switch (action) {
        case "query": {
          return async (args: any) => {
            const path = dotPath.join(".");

            const response = await fetch(`${options.prefix}/${path}`, {
              body: JSON.stringify(args),
              method: "POST",
            });

            return response.json();
          };
        }
        case "mutate": {
          return async (args: any) => {
            const path = dotPath.join(".");

            const response = await fetch(`${options.prefix}/${path}`, {
              body: JSON.stringify(args),
              method: "POST",
            });

            return response.json();
          };
        }
        case "globalAction$": {
          return trpcGlobalActionResolver$(
            () => ({ callerQrl, dotPath }),
            dotPath
          );
        }
        case "loader": {
          const event = opts.args[0] as RequestEventLoader;
          const args = opts.args[1];

          const task = async () => {
            const caller = await callerQrl(event);
            return trpcResolver(caller, dotPath, args);
          };

          return task();
        }
        case "routeAction$": {
          return trpcRouteActionResolver$(
            () => ({ callerQrl, dotPath }),
            dotPath
          );
        }
      }
    }, []) as DecoratedProcedureRecord<TRouter["_def"]["record"]>,
  };
};

export const serverTrpc$ = /*#__PURE__*/ implicit$FirstArg(serverTrpcQrl);
