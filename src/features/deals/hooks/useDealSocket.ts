"use client";

import { useEffect, useState, useRef } from "react";
import { getSocketClient } from "@/lib/socket/socket-client";
import { useSession } from "@/lib/auth/auth-client";
import { Deal } from "@/features/deals/types/deal";
import toast from "react-hot-toast";

export interface DealSocketOptions {
  onDealCreated?: (deal: Deal, meta: { userId: string; userName: string }) => void;
  onDealUpdated?: (deal: Deal, meta: { oldStage?: string; newStage?: string; userId: string; userName: string }) => void;
  onDealDeleted?: (dealId: string, meta: { userId: string; userName: string }) => void;
  showToasts?: boolean;
}

export function useDealSocket(options: DealSocketOptions = {}) {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (typeof window === "undefined" || status !== "authenticated") return;

    const socket = getSocketClient();

    const handleConnect = () => {
      setIsConnected(true);
      if (session?.user?.id) {
        socket.emit("join:pipeline", {
          userId: session.user.id,
          company: (session.user as { company?: string })?.company,
        });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleDealCreated = (payload: {
      deal: Deal;
      userId: string;
      userName: string;
    }) => {
      if (optionsRef.current.onDealCreated) {
        optionsRef.current.onDealCreated(payload.deal, {
          userId: payload.userId,
          userName: payload.userName,
        });
      }

      // Notify if created by a teammate
      if (
        optionsRef.current.showToasts &&
        payload.userId !== session?.user?.id &&
        payload.userName
      ) {
        toast(`✨ ${payload.userName} added lead: "${payload.deal.title}"`, {
          icon: "⚡",
          duration: 3500,
        });
      }
    };

    const handleDealUpdated = (payload: {
      deal: Deal;
      oldStage?: string;
      newStage?: string;
      userId: string;
      userName: string;
    }) => {
      if (optionsRef.current.onDealUpdated) {
        optionsRef.current.onDealUpdated(payload.deal, {
          oldStage: payload.oldStage,
          newStage: payload.newStage,
          userId: payload.userId,
          userName: payload.userName,
        });
      }

      // Notify if moved by a teammate
      if (
        optionsRef.current.showToasts &&
        payload.userId !== session?.user?.id &&
        payload.userName
      ) {
        if (payload.oldStage !== payload.newStage) {
          toast(
            `🔄 ${payload.userName} moved "${payload.deal.title}" to ${payload.newStage?.toUpperCase()}`,
            { icon: "⚡", duration: 3500 }
          );
        } else {
          toast(
            `📝 ${payload.userName} updated "${payload.deal.title}"`,
            { icon: "⚡", duration: 3000 }
          );
        }
      }
    };

    const handleDealDeleted = (payload: {
      dealId: string;
      userId: string;
      userName: string;
    }) => {
      if (optionsRef.current.onDealDeleted) {
        optionsRef.current.onDealDeleted(payload.dealId, {
          userId: payload.userId,
          userName: payload.userName,
        });
      }

      if (
        optionsRef.current.showToasts &&
        payload.userId !== session?.user?.id &&
        payload.userName
      ) {
        toast(`🗑️ ${payload.userName} removed a lead`, {
          icon: "⚡",
          duration: 3000,
        });
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("deal:created", handleDealCreated);
    socket.on("deal:updated", handleDealUpdated);
    socket.on("deal:deleted", handleDealDeleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("deal:created", handleDealCreated);
      socket.off("deal:updated", handleDealUpdated);
      socket.off("deal:deleted", handleDealDeleted);
    };
  }, [status, session?.user?.id, session?.user]);

  return { isConnected };
}
