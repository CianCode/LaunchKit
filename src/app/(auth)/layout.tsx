import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";
import { FieldDescription, FieldTitle } from "@/components/ui/field";
import { getSession } from "@/lib/auth-guards";

export default async function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user) {
    redirect("/");
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col gap-6">
          <a className="self-center" href="/">
            <FieldTitle>
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Acme Inc.
            </FieldTitle>
          </a>
          {children}
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
