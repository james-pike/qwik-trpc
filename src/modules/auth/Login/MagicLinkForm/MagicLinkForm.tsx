import { component$, useStore } from "@builder.io/qwik";
import { useTrpcContext } from "~/routes/context";

type State = {
  status: "idle" | "loading" | "success" | "error";
};

export const MagicLinkForm = component$(() => {
  const state = useStore<State>({ status: "idle" });
  const trpcContext = useTrpcContext();

  return (
    <form
      class="flex flex-col gap-2"
      preventdefault:submit
      method="post"
      onSubmit$={async (event) => {
        const form = new FormData(event.target as HTMLFormElement);
        const email = (form.get("email") as string) || "";
        try {
          state.status = "loading";
          const trpc = await trpcContext();
          await trpc?.auth.sendMagicLink.mutate({ email });
          state.status = "success";
        } catch (error) {
          state.status = "error";
        }
      }}
    >
      <h2 class="text-xl">Send magic link</h2>

      <div class="form-control w-full">
        <label for="email" class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          class="input-bordered input w-full"
          id="email"
          placeholder="Email"
          name="email"
          type="email"
        />
      </div>

      <button
        class={{
          "btn-primary btn mt-2": true,
          loading: state.status === "loading",
        }}
        type="submit"
      >
        Send
      </button>

      {state.status === "success" ? (
        <span>Success</span>
      ) : state.status === "error" ? (
        <span>Error</span>
      ) : null}
    </form>
  );
});
