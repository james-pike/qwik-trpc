import { component$, Resource, useStore } from "@builder.io/qwik";
import {
  DocumentHead,
  RequestHandler,
  useEndpoint,
} from "@builder.io/qwik-city";
import { CreatePostForm } from "~/modules/CreatePostForm/CreatePostForm";
import { serverCaller } from "~/server/trpc/router";

export const onGet: RequestHandler = async (ev) => {
  const { caller, context } = await serverCaller(ev);

  if (!context.user) {
    throw ev.response.redirect("/");
  }

  const posts = await caller.post.posts({ limit: 10, skip: 0 });

  return posts;
};

export default component$(() => {
  const resource = useEndpoint<string>();

  const store = useStore({ limit: 50, skip: 0 });

  // const resource = useResource$<string>(async ({ track, cleanup }) => {
  //   const limit = track(store, "limit");
  //   const skip = track(store, "skip");

  //   const abortController = new AbortController();
  //   cleanup(() => abortController.abort("cleanup"));

  //   console.log({ limit, skip });

  //   const posts = await trpc.post.posts.query(
  //     { limit, skip },
  //     {
  //       signal: abortController.signal,
  //       context: { isServer: typeof window === "undefined" },
  //     }
  //   );

  //   console.log({ posts });

  //   return "posts";
  // });

  return (
    <div>
      <h1>
        Welcome to Qwik <span class="lightning">⚡️</span>
      </h1>
      <CreatePostForm />
      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onResolved={(weather) => {
          return <div>Temperature: {weather}</div>;
        }}
      />
      <button onClick$={() => (store.skip -= store.limit)}>-</button>
      <button onClick$={() => (store.skip += store.limit)}>+</button>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
};