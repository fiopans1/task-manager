import { cn } from "@/shared/lib/utils";

export function PageContainer({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-4 py-6 pb-16 sm:px-6 lg:px-8 lg:py-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
