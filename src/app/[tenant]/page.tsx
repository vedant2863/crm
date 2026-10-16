import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import envConfig from "@/lib/config/envconfig";
import { TenantView } from "@/features/enterprise";

type Props = {
  params: Promise<{ tenant: string }>;
};

export default async function TenantPage({ params }: Props) {
  const { tenant } = await params;
  const mainSiteUrl = envConfig.auth.url;

  await dbConnect();

  // Find user matching tenant name or company name case-insensitively
  const cleanTenant = tenant.toLowerCase();
  const escapedTenant = cleanTenant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tenantUser = await User.findOne({
    $or: [
      { name: { $regex: new RegExp("^" + escapedTenant, "i") } },
      { company: { $regex: new RegExp("^" + escapedTenant + "$", "i") } },
    ],
  })
    .select("name company avatar bio")
    .lean();

  return (
    <TenantView
      tenant={tenant}
      tenantUser={tenantUser}
      mainSiteUrl={mainSiteUrl}
    />
  );
}
