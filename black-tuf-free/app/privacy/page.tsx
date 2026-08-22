import { LegalPage } from "@/features/site/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="January 1, 2026"
      sections={[
        {
          heading: "Information we collect",
          body: "We collect the information you provide when you create an account, request a quote, book a consultation, or contact us. This includes your name, email address, phone number, project details, and any files you upload to your project.",
        },
        {
          heading: "How we use your information",
          body: "Your information is used to provide and improve our services: managing projects, processing quotes and invoices, sending notifications, communicating about your project, and providing support.",
        },
        {
          heading: "Data storage and security",
          body: "Your data is stored in PostgreSQL databases protected by Row Level Security. Authentication is handled by Supabase Auth. Files you upload are stored in private storage buckets accessible only to you and our team. We take reasonable measures to protect your information from unauthorised access.",
        },
        {
          heading: "Sharing of information",
          body: "We do not sell your personal information. We share data only with team members who need it to deliver your project, and with service providers (such as cloud hosting) that process data on our behalf under appropriate confidentiality obligations.",
        },
        {
          heading: "Your rights",
          body: "You may access, correct, or request deletion of your personal information at any time by contacting us. You can also export or remove your data from the client portal.",
        },
        {
          heading: "Contact",
          body: "For privacy questions, contact us at hello@black-tuf.example.",
        },
      ]}
    />
  );
}
