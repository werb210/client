import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet } from "@/api/portal";

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function ProfilePage() {
  const { token } = useClientSession();

  const { data, isLoading } = useQuery<ProfileData>({
    queryKey: ["portal-profile"],
    queryFn: () => portalGet("profile", token!),
    enabled: !!token
  });

  if (isLoading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Profile</h1>

      <div className="p-4 bg-white rounded shadow space-y-2">
        <div>
          <div className="text-sm text-gray-600">Name</div>
          <div className="text-gray-900 font-semibold">{data?.name ?? "-"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Email</div>
          <div className="text-gray-900 font-semibold">{data?.email ?? "-"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Phone</div>
          <div className="text-gray-900 font-semibold">{data?.phone ?? "-"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Mailing Address</div>
          <div className="text-gray-900 font-semibold">{data?.address ?? "-"}</div>
        </div>
      </div>
    </div>
  );
}
