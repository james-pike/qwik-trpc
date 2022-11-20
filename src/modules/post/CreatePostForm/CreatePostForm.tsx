import { component$, PropFunction, useStore } from "@builder.io/qwik";
import { useTrpcContext } from "~/routes/context";
import { PostForm } from "../PostForm/PostForm";

type Props = {
  onSuccess$?: PropFunction<() => void>;
};

type State = {
  status: "idle" | "loading" | "success" | "error";
};

export const CreatePostForm = component$((props: Props) => {
  const state = useStore<State>({ status: "idle" });
  const trpcContext = useTrpcContext();
  const isLoading = state.status === "loading";

  return (
    <div>
      <PostForm
        isLoading={isLoading}
        onSubmit$={async ({ content }) => {
          try {
            state.status = "loading";
            const trpc = await trpcContext();
            await trpc?.post.create.mutate({ text: content });
            props.onSuccess$?.();
            state.status = "success";
          } catch (error) {
            state.status = "error";
          }
        }}
      />

      {state.status === "success" ? (
        <span>Success</span>
      ) : state.status === "error" ? (
        <span>Error</span>
      ) : null}
    </div>
  );
});
