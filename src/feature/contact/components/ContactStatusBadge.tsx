import React from "react";

interface ContactStatusBadgeProps {
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "prospect":
      return "bg-blue-100 text-blue-700";
    case "inactive":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

export default function ContactStatusBadge({
  status,
}: ContactStatusBadgeProps) {
  const safeStatus = status || "unknown";
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
        safeStatus
      )}`}
    >
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
}
