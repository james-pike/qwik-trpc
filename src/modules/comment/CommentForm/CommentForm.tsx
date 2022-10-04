import { component$, PropFunction } from "@builder.io/qwik";

type FormResult = {
  content: string;
};

type Props = {
  initialValue?: FormResult;
  isLoading: boolean;
  onSubmit$: PropFunction<(result: FormResult) => void>;
};

export const CommentForm = component$((props: Props) => {
  return (
    <form
      preventDefault:submit
      method="post"
      class="flex flex-col gap-2"
      onSubmit$={(event) => {
        const form = new FormData(event.target as HTMLFormElement);
        const content = (form.get("content") as string) || "";
        props.onSubmit$({ content });
      }}
    >
      <h2 class="text-xl">Add comment</h2>

      <div class="form-control w-full">
        <label htmlFor="content" class="label">
          <span class="label-text">Text</span>
        </label>
        <input
          id="content"
          class="input input-bordered w-full"
          name="content"
          placeholder="Type here"
          type="text"
          value={props.initialValue?.content}
        />
      </div>

      <button
        class={{
          "btn btn-primary mt-2": true,
          loading: props.isLoading,
        }}
        type="submit"
      >
        Save
      </button>
    </form>
  );
});