import { component$ } from "@builder.io/qwik";
import type { Comment } from "~/server/db/types";
import { TrpcActionStore } from "~/utils/trpc";
import { DeleteCommentForm } from "./DeleteCommentForm/DeleteCommentForm";
import { UpdateCommentForm } from "./UpdateCommentForm/UpdateCommentForm";

type Props = {
  comment: Comment;
  deleteCommentAction: TrpcActionStore;
  updateCommentAction: TrpcActionStore<Comment>;
};

export const CommentActions = component$<Props>((props) => {
  return (
    <>
      <DeleteCommentForm
        comment={props.comment}
        action={props.deleteCommentAction}
      />
      <UpdateCommentForm
        comment={props.comment}
        action={props.updateCommentAction}
      />
    </>
  );
});
