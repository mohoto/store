import { SiteHeader } from "@app/(dashboard)/site-header";
import { AddDiscountForm } from "./add-discount-form";

export default async function Page() {
  return (
    <>
      <SiteHeader title="Ajouter une réduction" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <AddDiscountForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
