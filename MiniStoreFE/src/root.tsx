// @refresh reload
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "flatpickr/dist/flatpickr.css";
import "./root.css";
import { AuthProvider } from "./context/Auth";
import LayoutSwitcher from "./layout/LayoutSwitcher";
import { SolidNProgress } from "solid-progressbar";
import { Toaster } from "solid-toast";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>MiniStore - Management System</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"
        ></link>
      </Head>
      <Body>
        <SolidNProgress color="#4F46E5" />
        <Toaster position="top-center" gutter={8} />
        <Suspense
          fallback={
            <div class="h-screen grid place-items-center">Loading...</div>
          }
        >
          <ErrorBoundary>
            <AuthProvider>
              <LayoutSwitcher>
                <Routes>
                  <FileRoutes />
                </Routes>
              </LayoutSwitcher>
            </AuthProvider>
          </ErrorBoundary>
        </Suspense>
        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
        ></script>
        <Scripts />
      </Body>
    </Html>
  );
}
