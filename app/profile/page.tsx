import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/page-header';
import ProfileForm from '@/components/profile/profile-form';
import UserRecipesList from '@/components/profile/user-recipes-list';
import Logo from '@/components/ui/logo';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      recipes: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          image: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          tags: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <PageHeader>
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Logo size="lg" showText={false} />
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
          <p className="text-muted-foreground">Manage your account and recipes</p>
        </div>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <ProfileForm user={user} />
          </div>
        </div>

        {/* User's Recipes */}
        <div className="lg:col-span-2">
          <UserRecipesList recipes={user.recipes} />
        </div>
      </div>
    </div>
  );
}
