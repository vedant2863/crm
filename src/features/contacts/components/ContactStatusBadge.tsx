"use client";

import { memo } from "react";
import { StatusBadge } from "@/components/common";

interface ContactStatusBadgeProps {
  status: string;
}

const ContactStatusBadge = memo(function ContactStatusBadge({
  status,
}: ContactStatusBadgeProps) {
  return <StatusBadge status={status || "unknown"} />;
});

export default ContactStatusBadge;
