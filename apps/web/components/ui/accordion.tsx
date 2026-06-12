import * as React from "react";
import { cn } from "../../lib/utils";

export function Accordion({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("divide-y divide-slate-800 rounded-lg border border-slate-800", className)} {...props} />;
}

export function AccordionItem({ className, ...props }: React.HTMLAttributes<HTMLDetailsElement>) {
  return <details className={cn("group bg-slate-950", className)} {...props} />;
}

export function AccordionTrigger({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <summary className={cn("cursor-pointer list-none px-4 py-4 font-medium text-white", className)} {...props} />;
}

export function AccordionContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 pb-4 text-sm text-slate-300", className)} {...props} />;
}
