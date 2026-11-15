import { PageContainer } from "@/shared/patterns/page-container";

export function CollectionPage({ header, toolbar, children, className }) {
  return (
    <PageContainer className={className}>
      <div className="space-y-5">
        {header}
        {toolbar}
        {children}
      </div>
    </PageContainer>
  );
}
