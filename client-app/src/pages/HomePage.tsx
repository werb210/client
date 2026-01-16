import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { CookieBanner } from "../components/CookieBanner";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-borealGray">
      <section className="max-w-6xl mx-auto px-6 py-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-6">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Boreal Financial
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-borealBlue leading-tight">
            Funding that keeps your business moving.
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-xl">
            Complete your application in minutes with a secure SMS magic-link
            that lets you pick up right where you left off.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="px-8" onClick={() => navigate("/apply/step-1")}>
              Start Your Application
            </Button>
          </div>
        </div>
        <div className="boreal-card p-6 space-y-4">
          <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
            What to expect
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-borealLightBlue flex items-center justify-center text-borealBlue font-semibold">
                1
              </div>
              <div>
                Answer a few questions about your business and funding needs.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-borealLightBlue flex items-center justify-center text-borealBlue font-semibold">
                2
              </div>
              <div>
                Review the product category that best matches your profile.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-borealLightBlue flex items-center justify-center text-borealBlue font-semibold">
                3
              </div>
              <div>
                Upload required documents or request a secure upload link.
              </div>
            </div>
          </div>
        </div>
      </section>
      <CookieBanner />
    </div>
  );
}
