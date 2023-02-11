import { component$ } from "@builder.io/qwik";
import type { Post } from "@prisma/client";
import { PostListItem } from "./PostListItem/PostListItem";

type Props = {
  posts: Post[];
};

export const PostsList = component$<Props>((props) => {
  return (
    <div class="flex flex-col gap-4">
      {props.posts.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </div>
  );
});
