import { ProfileView } from "@/features/profile";

export const metadata = {
  title: "User Profile | Social Media",
  description: "View user profile",
};

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  return <ProfileView userId={id} />;
}
