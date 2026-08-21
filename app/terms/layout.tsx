import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Figwork Student Ambassador Program",
  description: "Terms and conditions for the Figwork referral and student ambassador programs.",
  alternates: {
    canonical: "https://figwork.ai/student-ambassador-program/terms",
  },
};

export default function TermsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
