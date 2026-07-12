import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — DU Nest" },
      { name: "description", content: "Terms and Conditions for using DU Nest — the student housing platform for Delhi University." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-tagline text-3xl sm:text-4xl text-brand-cream">Terms &amp; Conditions</h1>
          <p className="text-brand-cream/50 mt-2 text-sm">Last updated: July 2025</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-8 text-navy">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using DU Nest ("the Platform"), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use the Platform.</p>
          </Section>

          <Section title="2. About DU Nest">
            <p>DU Nest is an online platform that helps Delhi University students discover verified PGs and flats near their colleges. We also facilitate roommate matching between students.</p>
          </Section>

          <Section title="3. For Property Owners / Listers">
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>All information submitted must be accurate, truthful, and up to date.</li>
              <li>Fake, misleading, or fraudulent listings will be permanently removed without notice.</li>
              <li>Listings are reviewed by our team before going live (typically within 24 hours).</li>
              <li>We reserve the right to reject or remove any listing at our sole discretion.</li>
              <li>Photos uploaded must be of the actual property. Stock images or misleading photos are not allowed.</li>
              <li>Listing on DU Nest is free. We do not charge any commission on bookings.</li>
              <li>You are solely responsible for the accuracy of pricing, availability, and property details.</li>
            </ul>
          </Section>

          <Section title="4. For Students / Users">
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>DU Nest is a discovery platform. We do not guarantee availability of any listed property.</li>
              <li>Always verify property details in person before making any payment or commitment.</li>
              <li>DU Nest is not a party to any rental agreement between students and property owners.</li>
              <li>We are not responsible for any disputes, losses, or damages arising from interactions with property owners.</li>
              <li>Roommate profiles are user-generated. Exercise caution when connecting with strangers.</li>
            </ul>
          </Section>

          <Section title="5. Photo Uploads">
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>By uploading photos, you confirm you own the rights to those images or have permission to use them.</li>
              <li>Photos must accurately represent the property being listed.</li>
              <li>We reserve the right to remove any photos that violate these terms or are deemed inappropriate.</li>
              <li>Uploaded photos may be used by DU Nest for promotional purposes on the platform.</li>
            </ul>
          </Section>

          <Section title="6. Roommate Matching">
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Roommate profiles are publicly visible to other users of the platform.</li>
              <li>Do not share sensitive personal information (Aadhaar, bank details, etc.) in your profile.</li>
              <li>DU Nest is not responsible for any outcomes of roommate connections made through the platform.</li>
              <li>Profiles with false information will be removed.</li>
            </ul>
          </Section>

          <Section title="7. Privacy">
            <p>We collect only the information necessary to operate the platform. Your WhatsApp number and email are used solely for communication related to your listing or profile. We do not sell your data to third parties.</p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>All content on DU Nest — including design, text, and code — is the property of DU Nest. You may not reproduce or redistribute any part of the platform without written permission.</p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>DU Nest provides the platform "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
          </Section>

          <Section title="11. Contact">
            <p>For any questions regarding these Terms, please reach out to us via WhatsApp or email listed on the platform.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-tagline text-lg text-navy mb-2">{title}</h2>
      <div className="text-sm text-navy/80 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
