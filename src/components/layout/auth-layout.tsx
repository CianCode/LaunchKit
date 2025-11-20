import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function AuthLayout({
  children,
  imageSrc = "/background/auth/bg-glass-color.png",
  imageAlt = "Authentication Background",
  className,
}: AuthLayoutProps) {
  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      <CardContent className="grid p-0 md:grid-cols-2">
        <div className="p-6 md:p-8">{children}</div>
        <div className="relative hidden bg-muted md:block">
          <Image
            alt={imageAlt}
            className="object-cover dark:brightness-[0.2] dark:grayscale"
            fill
            src={imageSrc}
          />
        </div>
      </CardContent>
    </Card>
  );
}
