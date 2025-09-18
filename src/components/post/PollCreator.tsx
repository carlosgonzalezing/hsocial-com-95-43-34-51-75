
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";

export interface Poll {
  question: string;
  options: string[];
  multiple_choice: boolean;
  expires_at: string;
}

interface PollCreatorProps {
  poll: Poll;
  setPoll: (poll: Poll) => void;
}

export function PollCreator({ poll, setPoll }: PollCreatorProps) {
  console.log("PollCreator rendered with poll:", poll);

  const addOption = () => {
    if (poll.options.length < 4) {
      const newOptions = [...poll.options, ""];
      console.log("Adding option, new options:", newOptions);
      setPoll({
        ...poll,
        options: newOptions
      });
    }
  };

  const removeOption = (index: number) => {
    if (poll.options.length > 2) {
      const newOptions = poll.options.filter((_, i) => i !== index);
      console.log("Removing option, new options:", newOptions);
      setPoll({
        ...poll,
        options: newOptions
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...poll.options];
    newOptions[index] = value;
    console.log("Updating option", index, "to:", value);
    setPoll({
      ...poll,
      options: newOptions
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="poll-question">Pregunta de la encuesta</Label>
        <Input
          id="poll-question"
          placeholder="Escribe tu pregunta..."
          value={poll.question}
          onChange={(e) => {
            console.log("Updating poll question to:", e.target.value);
            setPoll({ ...poll, question: e.target.value });
          }}
        />
      </div>

      <div>
        <Label>Opciones</Label>
        <div className="space-y-2 mt-2">
          {poll.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`Opción ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
              {poll.options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {poll.options.length < 4 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addOption}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir opción
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="multiple-choice">Permitir selección múltiple</Label>
        <Switch
          id="multiple-choice"
          checked={poll.multiple_choice}
          onCheckedChange={(checked) => {
            console.log("Updating multiple choice to:", checked);
            setPoll({ ...poll, multiple_choice: checked });
          }}
        />
      </div>

      <div>
        <Label htmlFor="expires-at">Fecha de expiración</Label>
        <Input
          id="expires-at"
          type="datetime-local"
          value={poll.expires_at}
          onChange={(e) => {
            console.log("Updating expires_at to:", e.target.value);
            setPoll({ ...poll, expires_at: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
