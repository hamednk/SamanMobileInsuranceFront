"use client";

import { RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, notifyError } from "@/lib/api";

type CaptchaChallenge = {
  captchaId: string;
  imageSvg: string;
};

type CaptchaValue = {
  captchaId: string;
  captchaCode: string;
};

type CaptchaFieldProps = {
  onChange: (value: CaptchaValue) => void;
  refreshKey?: number;
};

export function CaptchaField({ onChange, refreshKey = 0 }: CaptchaFieldProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const load = useCallback(async () => {
    setLoading(true);
    setCode("");
    onChangeRef.current({ captchaId: "", captchaCode: "" });
    try {
      const data = await api.get<CaptchaChallenge>("/api/v1/auth/captcha");
      setChallenge(data);
      onChangeRef.current({ captchaId: data.captchaId, captchaCode: "" });
    } catch (error) {
      notifyError(error);
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <Field>
      <FieldLabel htmlFor="captchaCode">کد امنیتی</FieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        {challenge ? (
          <div
            className="flex h-14 min-w-[180px] items-center justify-center overflow-hidden rounded-lg border border-input bg-muted/40"
            dangerouslySetInnerHTML={{ __html: challenge.imageSvg }}
            aria-live="polite"
          />
        ) : (
          <div className="flex h-14 min-w-[180px] items-center justify-center rounded-lg border border-input bg-muted/40">
            {loading ? <Spinner /> : <span className="text-xs text-muted-foreground">بدون تصویر</span>}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 shrink-0"
          onClick={() => void load()}
          disabled={loading}
          aria-label="تصویر جدید"
        >
          {loading ? <Spinner /> : <RefreshCwIcon />}
        </Button>
        <Input
          id="captchaCode"
          name="captchaCode"
          value={code}
          onChange={(event) => {
            const next = event.target.value.toUpperCase();
            setCode(next);
            onChangeRef.current({
              captchaId: challenge?.captchaId ?? "",
              captchaCode: next.trim(),
            });
          }}
          autoComplete="off"
          required
          maxLength={8}
          className="min-h-11 min-w-[8rem] flex-1"
          dir="ltr"
          placeholder="کد تصویر"
        />
      </div>
      <FieldDescription>حروف و اعداد تصویر را وارد کنید.</FieldDescription>
    </Field>
  );
}
