import { component$, Resource } from "@builder.io/qwik";
import { action$, DocumentHead, loader$ } from "@builder.io/qwik-city";
import { getTrpcFromEvent } from "~/server/loaders";
import { trpcAction } from "~/server/trpc/action";
import { useTrpcAction } from "~/utils/trpc";
import { PostsList } from "../PostsList/PostsList";

export const getData = loader$(async (event) => {
  const trpc = await getTrpcFromEvent(event);
  const result = await trpc.post.list({ skip: 0, take: 10 });
  return result;
});

export const createPost = action$(trpcAction);

export default component$(() => {
  const resource = getData.use();

  const action = useTrpcAction(createPost.use()).post.create();

  return (
    <div class="flex flex-col gap-2">
      <button
        onClick$={() => {
          action.execute({ content: "Hello123" });
        }}
      >
        Create Post
      </button>
      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onResolved={(result) => <PostsList posts={result.posts} />}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Testing - Welcome to Qwik",
};