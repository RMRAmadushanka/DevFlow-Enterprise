"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";

import { Modal } from "@/components/feedback/modal";
import { Button } from "@/components/ui/button";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";
import { toast } from "@/components/feedback/toast";

import { useCreateApiKey } from "../hooks/use-account";
import {
  createApiKeySchema,
  type CreateApiKeyFormValues,
} from "../schemas/auth.schema";
import type { ApiKeyRecord } from "../types/auth.types";

export interface CreateApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateApiKeyModal({ open, onOpenChange }: CreateApiKeyModalProps) {
  const create = useCreateApiKey();
  const [created, setCreated] = React.useState<ApiKeyRecord | null>(null);
  const [copied, setCopied] = React.useState(false);

  const form = useAppForm({
    schema: createApiKeySchema,
    defaultValues: { name: "" } satisfies CreateApiKeyFormValues,
    onSubmit: async (values) => {
      const key = await create.mutateAsync(values.name);
      setCreated(key);
      toast.success("API key created");
    },
  });

  React.useEffect(() => {
    if (!open) {
      setCreated(null);
      setCopied(false);
      form.reset({ name: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={created ? "Copy your API key" : "Create API key"}
      description={
        created
          ? "This secret is shown once. Store it securely — we cannot show it again."
          : "Name the key so you can revoke it later."
      }
    >
      {created?.secret ? (
        <div className="flex flex-col gap-4">
          <AlertBanner
            tone="warning"
            title="Copy now"
            description="Closing this dialog permanently hides the secret."
          />
          <code className="break-all rounded-lg bg-muted p-3 text-xs">{created.secret}</code>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(created.secret!);
              setCopied(true);
              toast.success("Copied to clipboard");
            }}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy key"}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      ) : (
        <AppForm form={form} className="gap-4">
          <FormController
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput {...field} label="Key name" required error={fieldState.error?.message} />
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton loading={form.isSubmitting || create.isPending}>Create</SubmitButton>
          </div>
        </AppForm>
      )}
    </Modal>
  );
}

export { CreateApiKeyModal };
