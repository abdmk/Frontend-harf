import { Collapsible as CollapsiblePrimitive } from 'radix-ui';

import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, MailIcon } from '@/components/ui/icons';
import { CONTACT_EMAIL, FAQ } from '@/config/faq';

export function HelpSection() {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="أسئلة شائعة" bodyClassName="p-2">
        <ul className="flex flex-col divide-y">
          {FAQ.map(([q, a]) => (
            <li key={q}>
              <CollapsiblePrimitive.Root>
                <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between gap-4 rounded-sm px-4 py-4 text-start text-control font-medium hover:bg-sunken">
                  {q}
                  <ChevronDownIcon className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsiblePrimitive.Trigger>
                <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <p className="px-4 pb-4 text-meta text-muted-foreground">{a}</p>
                </CollapsiblePrimitive.Content>
              </CollapsiblePrimitive.Root>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="تواصل معنا" description="نردّ عادةً خلال يوم عمل.">
        <Button asChild variant="outline">
          <a href={`mailto:${CONTACT_EMAIL}`}>
            <MailIcon />
            {CONTACT_EMAIL}
          </a>
        </Button>
      </SectionCard>
    </div>
  );
}
