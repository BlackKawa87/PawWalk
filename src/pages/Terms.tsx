import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const LAST_UPDATED = "April 21, 2026";

const sections = [
  {
    id: "platform-role",
    title: "1. Platform Role",
    content: [
      "PawGo is a technology platform that connects dog owners with independent dog walkers. PawGo does not itself provide dog walking, pet care, or any related services.",
      "PawGo is not a dog walking company. The company does not employ Walkers and is not responsible for the actions, omissions, quality, safety, or outcome of any services provided by Walkers.",
      "Any service agreement is formed directly between the Owner and the Walker. PawGo facilitates this connection but is not a party to that agreement.",
    ],
  },
  {
    id: "independent-contractors",
    title: "2. Walkers as Independent Contractors",
    content: [
      "All Walkers on PawGo operate as independent contractors, not employees, agents, or representatives of PawGo.",
      "PawGo does not control, direct, or supervise how Walkers perform their services. Walkers set their own hours, prices, and service conditions.",
      "PawGo does not guarantee the quality, safety, or suitability of any Walker. Background checks are conducted as a trust-building measure but do not constitute a guarantee or endorsement.",
    ],
  },
  {
    id: "liability",
    title: "3. Limitation of Liability",
    content: [
      "PawGo shall not be liable for any injury, loss, damage, theft, escape, illness, or death of any pet arising from services performed by a Walker.",
      "PawGo shall not be liable for any damage to property caused by a Walker or pet during a walk.",
      "PawGo's total liability to any user for any claim is limited to the platform fees paid in the 30 days preceding the claim.",
      "Users acknowledge that they use the platform at their own risk and that PawGo makes no warranties — express or implied — regarding the services provided by Walkers.",
    ],
  },
  {
    id: "owner-responsibilities",
    title: "4. Owner Responsibilities",
    content: [
      "Owners are responsible for providing accurate information about their pet, including health conditions, temperament, and any known risks.",
      "Owners are responsible for ensuring their pet is up to date with vaccinations and is fit to be walked.",
      "Owners are responsible for any injury or damage caused by their pet to a Walker, third party, or property during a walk.",
    ],
  },
  {
    id: "walker-responsibilities",
    title: "5. Walker Responsibilities",
    content: [
      "Walkers are responsible for the standard of care they provide to pets during a booking.",
      "Walkers must hold their own appropriate insurance for pet care services where required by law.",
      "Walkers must not subcontract or delegate a booking to any other person without the Owner's prior written consent.",
      "Walkers are responsible for complying with all applicable local laws and regulations regarding animal care.",
    ],
  },
  {
    id: "payments",
    title: "6. Payments and Fees",
    content: [
      "PawGo charges a platform commission of 18% on Walker earnings. This fee covers platform maintenance, payment processing, and customer support.",
      "Payments are processed through the platform. PawGo acts as a limited payment agent for Walkers for the purpose of collecting funds from Owners.",
      "Refunds are subject to the PawGo cancellation policy. Disputes between Owners and Walkers are resolved directly between the parties; PawGo may assist as a mediator but is not obligated to do so.",
    ],
  },
  {
    id: "background-checks",
    title: "7. Background Checks",
    content: [
      "PawGo requires all Walkers to undergo a background check prior to their first booking. In the UK, this is a DBS (Disclosure and Barring Service) check. In the USA, this is conducted through a third-party provider.",
      "The completion of a background check does not constitute a guarantee, endorsement, or warranty of any Walker's fitness, character, or suitability for pet care.",
      "Background check results are based on available records at the time of the check and may not reflect subsequent events.",
    ],
  },
  {
    id: "user-conduct",
    title: "8. User Conduct",
    content: [
      "Users must not use PawGo for any unlawful purpose or in violation of these Terms.",
      "Users must not attempt to circumvent the platform by arranging payments directly with Walkers/Owners outside of PawGo for bookings that originated through the platform.",
      "PawGo reserves the right to suspend or terminate accounts that violate these Terms without notice.",
    ],
  },
  {
    id: "privacy",
    title: "9. Privacy",
    content: [
      "PawGo collects and processes personal data in accordance with our Privacy Policy. By using PawGo, you consent to this processing.",
      "Location data used during walks is collected solely for the purpose of providing GPS tracking to the Owner and is not shared with third parties for commercial purposes.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to These Terms",
    content: [
      "PawGo reserves the right to update these Terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms.",
      "Material changes will be communicated to users via email or in-app notification with reasonable notice.",
    ],
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    content: [
      "For users in the United Kingdom, these Terms are governed by the laws of England and Wales.",
      "For users in the United States, these Terms are governed by the laws of the State of Delaware.",
      "Any disputes shall be subject to the exclusive jurisdiction of the courts of the applicable territory.",
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-lg text-primary">PawGo</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="secondary" className="mb-4 text-primary border-primary/20">Legal</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> PawGo is a technology platform that connects dog owners with independent walkers.{" "}
              <strong className="text-foreground">PawGo does not provide dog walking services and is not responsible for the care, safety, or supervision of pets.</strong>{" "}
              By using PawGo, you agree to these Terms in full.
            </p>
          </div>
        </div>

        {/* Table of contents */}
        <div className="mb-10 p-4 rounded-xl border border-border bg-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contents</p>
          <ul className="space-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-lg font-semibold text-foreground mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.content.map((paragraph, j) => (
                  <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              {i < sections.length - 1 && <Separator className="mt-10" />}
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-14 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Questions about these Terms?{" "}
            <a href="mailto:legal@pawgo.com" className="text-primary hover:underline">Contact us at legal@pawgo.com</a>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            © 2026 PawGo. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
