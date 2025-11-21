import { LogoutButton } from "@/components/auth/logout-button";
import { clientEnv } from "@/env";

export default async function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <svg
            className="h-20 w-20"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Launchkit logo</title>
            <path
              className="text-zinc-700 dark:text-zinc-300"
              d="M12 2C12 2 7 4 7 9V14C7 14 7 15 8 15H16C17 15 17 14 17 14V9C17 4 12 2 12 2Z"
              fill="currentColor"
            />
            <path
              className="text-zinc-600 dark:text-zinc-400"
              d="M8 15L6 19L7 20L12 17L17 20L18 19L16 15"
              fill="currentColor"
            />
            <circle
              className="text-zinc-50"
              cx="12"
              cy="10"
              fill="currentColor"
              r="2"
            />
            <path
              className="text-zinc-600 dark:text-zinc-400"
              d="M5 11C5 11 3 11 3 13C3 15 5 15 5 15"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <path
              className="text-zinc-600 dark:text-zinc-400"
              d="M19 11C19 11 21 11 21 13C21 15 19 15 19 15"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <h1 className="mb-4 font-bold text-4xl text-zinc-800 dark:text-zinc-200">
          Welcome to {clientEnv.NEXT_PUBLIC_PROJECT_NAME}
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Your journey to building amazing apps starts here.
        </p>
        <LogoutButton />
      </div>
    </div>
  );
}
