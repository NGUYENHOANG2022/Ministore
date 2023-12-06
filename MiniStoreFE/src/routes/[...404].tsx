import { A } from "@solidjs/router";
import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import routes from "~/utils/routes";

export default function NotFound() {
  return (
    <main class="grid place-items-center mx-auto py-24 px-6 sm:py-32 lg:px-8">
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <div class="text-center">
        <p class="text-base font-semibold text-indigo-600">404</p>
        <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p class="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <A
            href={routes.dashboard}
            class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Back to home
          </A>
          <A
            href="/contact"
            class="text-sm font-semibold text-gray-900 hover:text-indigo-700"
          >
            Contact us <span aria-hidden="true">&rarr;</span>
          </A>
        </div>
      </div>
    </main>
  );
}
