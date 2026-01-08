import BackgroundEffects from "~/components/BackgroundEffects";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-neutral-950 overflow-hidden">
      <BackgroundEffects />
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="relative border border-white/10 bg-neutral-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-widest">
              SYSTEM ACCESS
            </h1>
            <p className="text-indigo-400 font-mono text-xs uppercase">
              Authentication Required
            </p>
          </div>
          <div className="flex justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}