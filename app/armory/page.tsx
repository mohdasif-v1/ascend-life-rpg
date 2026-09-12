import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ArmoryClient from "@/components/ArmoryClient";

export const metadata = {
  title: "Armory — ASCEND Life RPG",
  description: "Spend your hard-earned gold to strengthen your character.",
};

export default async function ArmoryPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return <ArmoryClient />;
}
