import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <SignIn
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: "w-full",
          card: "bg-transparent shadow-none w-full",
          headerTitle: "hidden",
          headerSubtitle: "hidden",
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 !shadow-none text-white",
          formFieldInput: "bg-neutral-900/50 border-neutral-700 text-white",
          formFieldLabel: "text-neutral-400",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
          identityPreviewText: "text-neutral-300",
          formHeaderTitle: "text-white",
          formHeaderSubtitle: "text-neutral-400",
        },
      }}
    />
  );
}