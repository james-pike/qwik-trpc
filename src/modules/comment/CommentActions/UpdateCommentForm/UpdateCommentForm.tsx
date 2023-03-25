import { $, component$, useSignal } from "@builder.io/qwik";
import type { Comment } from "@prisma/client";
import { trpcGlobalAction$ } from "~/lib/qwik-trpc2";
import { getTrpcFromEvent } from "~/server/loaders";
import { CommentForm } from "../../CommentForm/CommentForm";

export const useUpdateCommentAction = trpcGlobalAction$(() => ({
  caller: $((event) => getTrpcFromEvent(event)),
  dotPath: ["comment", "update"],
}));

type Props = {
  comment: Comment;
};

export const UpdateCommentForm = component$<Props>((props) => {
  const isOpen = useSignal(false);

  const action = useUpdateCommentAction();

  return (
    <>
      <button
        class="btn"
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
      >
        Edit
      </button>

      {isOpen.value && (
        <>
          <CommentForm
            initialValue={props.comment}
            isLoading={action.isRunning}
            onSubmit$={async ({ content }) => {
              await action.run({ content, id: props.comment.id });
              isOpen.value = false;
            }}
          />

          {action.value?.status === "success" ? (
            <span>Success</span>
          ) : action.value?.status === "error" ? (
            <pre>{JSON.stringify(action.value, null, 2)}</pre>
          ) : null}
        </>
      )}
    </>
  );
});
