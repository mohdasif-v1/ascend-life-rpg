import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ChronicleClient from "@/components/ChronicleClient";

export const metadata = {
  title: "Chronicle — ASCEND Life RPG",
  description: "A permanent ledger of your conquered quests and personal triumphs.",
};

export default async function ChroniclePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return <ChronicleClient />;
}
