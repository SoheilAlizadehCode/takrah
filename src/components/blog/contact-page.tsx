"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageShell, Section } from "./static-pages";

/** صفحه تماس با ما — فرم نیاز به حالت تعاملی دارد (کلاینت) */
export function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً همه فیلدها را کامل کنید.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "پیام شما ثبت شد",
      description: "کار تیم تک‌راه در اولین فرصت با شما تماس می‌گیرد. متشکریم!",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <PageShell
      title="تماس با ما"
      subtitle="سؤالی دارید، پیشنهاد موضوعی هست یا می‌خواهید همکاری کنید؟ خوشحال می‌شویم بشنویم."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <a
          href={`mailto:${siteConfig.email}`}
          className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold">ایمیل</span>
            <span className="mt-1 block text-sm text-muted-foreground transition-colors group-hover:text-primary">
              {siteConfig.email}
            </span>
          </span>
        </a>
        <div className="flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold">پاسخ‌دهی</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              معمولاً حداکثر تا ۴۸ ساعت کاری پاسخ می‌دهیم
            </span>
          </span>
        </div>
      </div>

      <Section title="فرم پیام">
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="فرم تماس">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-sm font-medium">
                نام شما
              </label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً سارا محمدی"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-sm font-medium">
                ایمیل شما
              </label>
              <Input
                id="contact-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 text-start"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="contact-message" className="text-sm font-medium">
              پیام شما
            </label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="هر چه در دل دارید بنویسید…"
              rows={6}
              className="min-h-28"
            />
          </div>
          <Button type="submit" className="h-11 gap-2 px-6">
            <Send className="h-4 w-4" aria-hidden="true" />
            ارسال پیام
          </Button>
        </form>
      </Section>

      <Section title="گزارش خطا در محتوا">
        <p>
          دقت، اعتبار ماست. اگر اشکالی در یکی از مقالات دیدید — از غلط تایپی تا نکته فنی —
          لطفاً با عنوان مقاله و توضیح مشکل به ما خبر دهید. با نام خودتان از شما تشکر خواهیم
          کرد و متن را سریع اصلاح می‌کنیم.
        </p>
      </Section>
    </PageShell>
  );
}
