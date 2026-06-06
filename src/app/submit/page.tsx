import { SubmitForm } from "@/components/salary/submit-form";

export const metadata = {
  title: "Submit Compensation",
  description: "Anonymously submit your compensation data to help others make informed decisions.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Submit Compensation</h1>
        <p className="mt-2 text-slate-500">
          Share your compensation anonymously. All fields are validated and duplicates are prevented.
        </p>
      </div>

      <SubmitForm />
    </div>
  );
}
