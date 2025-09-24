import { SiteHeader } from "@app/(dashboard)/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader title="Clients" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div>Page clients</div>
          </div>
        </div>
      </div>
    </>
  );
}
