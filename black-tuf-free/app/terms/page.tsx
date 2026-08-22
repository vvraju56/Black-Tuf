import { LegalPage } from "@/features/site/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="January 1, 2026"
      sections={[
        {
          heading: "Agreement",
          body: "By creating an account or engaging Black Tuf for services, you agree to these terms. Each project is additionally governed by a project-specific agreement or quotation that you accept when commissioning work.",
        },
        {
          heading: "Services",
          body: "Black Tuf provides software development, design, AI, IoT, PLC programming and electrical engineering services. Project scope, timeline, and deliverables are defined in the quotation and client portal for each project.",
        },
        {
          heading: "Client responsibilities",
          body: "You agree to provide accurate requirements and timely feedback, grant access to systems or sites required for the work, and respond to requests within a reasonable time so your project stays on schedule.",
        },
        {
          heading: "Payments and invoices",
          body: "Invoices are issued per project. Payments are due by the due date shown on the invoice. Late payments may pause active work until cleared. Payment methods include bank transfer, UPI and card.",
        },
        {
          heading: "Intellectual property",
          body: "Upon full payment, you own the final deliverables created for your project. Black Tuf retains rights to our pre-existing tools, frameworks and internal libraries.",
        },
        {
          heading: "Limitation of liability",
          body: "To the maximum extent permitted by law, Black Tuf is not liable for indirect, incidental or consequential damages arising from use of our services. Our total liability is limited to the amount paid for the specific project.",
        },
        {
          heading: "Governing law",
          body: "These terms are governed by the laws of India, and any disputes are subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.",
        },
      ]}
    />
  );
}
