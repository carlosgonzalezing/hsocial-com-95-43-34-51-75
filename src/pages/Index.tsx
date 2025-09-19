
import React from "react";
import { SocialScoolLayout } from "@/components/SocialScoolLayout";
import { SocialScoolFeed } from "@/components/SocialScoolFeed";
import { useAuth } from "@/hooks/use-auth";

export default function Index() {
  const { user } = useAuth();

  return (
    <SocialScoolLayout>
      <SocialScoolFeed />
    </SocialScoolLayout>
  );
}
