import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db/client";

export class AppAuthenticationError extends Error {
  readonly code = "APP_AUTHENTICATION_ERROR";

  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "AppAuthenticationError";
  }
}

const getFallbackCompanyName = (email: string): string => {
  const localPart = email.split("@")[0];

  if (!localPart) {
    return "FinFlow Company";
  }

  return `${localPart} GmbH`;
};

export const requireAuthenticatedAppUser = async (): Promise<{
  id: string;
  clerkId: string;
  email: string;
  companyName: string;
}> => {
  const { userId } = await auth();

  if (!userId) {
    throw new AppAuthenticationError();
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new AppAuthenticationError("Unable to load the current Clerk user.");
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new AppAuthenticationError("A primary email address is required.");
  }

  const companyName =
    clerkUser.username?.trim() ||
    `${clerkUser.firstName?.trim() ?? ""} ${clerkUser.lastName?.trim() ?? ""}`.trim() ||
    getFallbackCompanyName(primaryEmail);

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: primaryEmail,
      companyName,
    },
    create: {
      clerkId: userId,
      email: primaryEmail,
      companyName,
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      companyName: true,
    },
  });
};
