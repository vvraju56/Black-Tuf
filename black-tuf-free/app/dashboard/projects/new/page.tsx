import { PostProjectWizard } from "@/features/projects/post-project-wizard";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="py-2">
      <PostProjectWizard />
    </div>
  );
}
