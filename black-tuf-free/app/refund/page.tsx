import { LegalPage } from "@/features/site/legal-page";

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="January 1, 2026"
      sections={[
        {
          heading: "Deposits",
          body: "Projects may require a deposit before work begins. Deposits are used to reserve engineering time and cover initial scoping and setup.",
        },
        {
          heading: "Cancellation before start",
          body: "If you cancel a project before any work has begun, your deposit is refunded in full. If work has already started, the deposit covers the work performed to date and is non-refundable.",
        },
        {
          heading: "Milestone-based work",
          body: "Payments are tied to agreed milestones. Once a milestone is delivered and accepted, the payment for that milestone is non-refundable.",
        },
        {
          heading: "Unsatisfactory deliverables",
          body: "If we fail to deliver what was agreed in the quotation, we will correct the issue at no additional cost. If we cannot deliver at all, you are entitled to a refund for the undelivered portion of the work.",
        },
        {
          heading: "Refund processing",
          body: "Approved refunds are processed to the original payment method within 7–10 business days.",
        },
        {
          heading: "Contact",
          body: "To request a refund, contact us at hello@black-tuf.example with your invoice number and reason.",
        },
      ]}
    />
  );
}
