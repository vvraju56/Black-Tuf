"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard, EmptyState } from "@/components/profile/sections/section-card";
import { useAddSkill, useRemoveSkill, useReorderSkills } from "@/hooks/use-profile";
import type { UserSkill } from "@/types";
import { toast } from "sonner";

export function SkillsSection({
  skills = [],
  editable,
}: {
  skills?: UserSkill[];
  editable?: boolean;
}) {
  const [skillInput, setSkillInput] = useState("");
  const add = useAddSkill();
  const remove = useRemoveSkill();
  const reorder = useReorderSkills();

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    add.mutate(value, {
      onSuccess: () => {
        setSkillInput("");
        toast.success("Skill added");
      },
      onError: (e) => toast.error(e.message ?? "Failed to add skill"),
    });
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...skills];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((s) => s.skill_id));
  };

  return (
    <SectionCard
      id="skills"
      title="Skills"
      description="Technologies and capabilities"
      icon={Wrench}
      action={
        editable ? (
          <div className="flex w-56 gap-1.5">
            <Input
              placeholder="Add a skill…"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <Button size="sm" variant="secondary" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : undefined
      }
    >
      {skills.length === 0 ? (
        <EmptyState
          message="No skills added yet"
          hint="Add skills to get matched with relevant projects."
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {skills.map((s, i) => (
            <Badge key={s.skill_id} variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
              {s.skill?.name ?? "Skill"}
              {editable && (
                <>
                  <button
                    onClick={() => move(i, -1)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() =>
                      remove.mutate(s.skill_id, {
                        onError: (e) => toast.error(e.message ?? "Failed"),
                      })
                    }
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove skill"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              )}
            </Badge>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
