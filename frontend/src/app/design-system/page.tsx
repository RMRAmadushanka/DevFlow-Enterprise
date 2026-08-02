"use client";

/**
 * Internal design-system showcase / living style guide.
 *
 * This route is NOT an application page — it exists purely to visually
 * verify tokens and primitives render correctly in both themes. It is the
 * only route in this repo; there is no business logic here.
 */
import * as React from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  ChevronRight,
  Copy,
  Home,
  Info,
  Plus,
  Settings,
  TriangleAlert,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ThemeToggle } from "@/design-system/theme/theme-toggle";
import { hoverLift, staggerContainer, staggerItem } from "@/design-system/motion/variants";
import { colors } from "@/design-system/tokens/colors";
import { typeScale } from "@/design-system/tokens/typography";
import { spacing } from "@/design-system/tokens/spacing";
import { radius } from "@/design-system/tokens/radius";
import { shadows } from "@/design-system/tokens/shadows";
import { iconSize } from "@/design-system/tokens/icons";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-divider py-12 first:pt-0">
      <div className="mb-6 flex flex-col gap-1">
        <Text variant="title" as="h2">
          {title}
        </Text>
        {description && <Text tone="secondary">{description}</Text>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 w-full rounded-lg border border-border"
        style={{ backgroundColor: hex }}
      />
      <div>
        <Text variant="label" className="block">
          {name}
        </Text>
        <Text variant="small" tone="muted" className="font-mono">
          {hex}
        </Text>
      </div>
    </div>
  );
}

const colorGroups: Array<{ label: string; keys: Array<keyof typeof colors.dark> }> = [
  { label: "Surfaces", keys: ["background", "surface", "card", "elevated", "sidebar"] },
  { label: "Borders", keys: ["border", "divider", "input", "ring"] },
  { label: "Primary", keys: ["primary", "primaryHover", "primaryActive", "primaryMuted"] },
  { label: "Secondary & Accent", keys: ["secondary", "secondaryHover", "accent"] },
  { label: "Status", keys: ["success", "warning", "danger", "info"] },
  { label: "Text", keys: ["textPrimary", "textSecondary", "textMuted", "disabled", "link"] },
];

export default function DesignSystemShowcasePage() {
  const [progress, setProgress] = React.useState(46);

  React.useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 20 : p + 8)), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Text variant="label" className="text-[11px] font-bold text-primary-foreground">
                DF
              </Text>
            </div>
            <Text variant="bodyStrong">DevFlow Enterprise — Design System</Text>
          </div>
          <ThemeToggle />
        </Container>
      </header>

      <Container className="py-10">
        <div className="mb-12 flex flex-col gap-3">
          <Text variant="display" as="h1">
            Design System Foundation
          </Text>
          <Text tone="secondary" className="max-w-2xl">
            Complete token set, theme architecture, and primitive components for DevFlow
            Enterprise. Toggle the theme above — every token below reacts live.
          </Text>
        </div>

        <Section id="colors" title="Color System" description="Semantic tokens, resolved for the active theme.">
          <div className="flex flex-col gap-8">
            {colorGroups.map((group) => (
              <div key={group.label}>
                <Text variant="label" tone="muted" className="mb-3 block uppercase tracking-wide">
                  {group.label}
                </Text>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {group.keys.map((key) => (
                    <Swatch key={key} name={key} hex={colors.dark[key]} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="typography" title="Typography" description="Inter for UI, JetBrains Mono for code.">
          <div className="flex flex-col gap-4">
            {Object.entries(typeScale).map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-6 border-b border-divider pb-3">
                <Text variant="small" tone="muted" className="w-32 shrink-0 font-mono">
                  {key} · {value.fontSize}
                </Text>
                <Text variant={key as never} className="truncate">
                  DevFlow Enterprise
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section id="spacing" title="Spacing Scale" description="4px/8pt grid — matches Tailwind's default spacing utilities.">
          <div className="flex flex-wrap items-end gap-4">
            {Object.entries(spacing).map(([step, value]) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="bg-primary" style={{ width: value.px, height: 16 }} />
                <Text variant="small" tone="muted" className="font-mono">
                  {value.px}px
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section id="radius" title="Border Radius">
          <div className="flex flex-wrap gap-6">
            {Object.entries(radius).map(([key, value]) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <div
                  className="size-16 border border-border bg-surface"
                  style={{ borderRadius: value.px }}
                />
                <Text variant="small" tone="muted">
                  {key}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section id="shadows" title="Shadow System">
          <div className="flex flex-wrap gap-8">
            {Object.entries(shadows).map(([key, value]) => (
              <div key={key} className="flex flex-col items-center gap-3">
                <div className={`size-20 rounded-lg bg-card ${value.className}`} />
                <Text variant="small" tone="muted">
                  {key}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section id="motion" title="Motion" description="Hover a card and press a button — subtle, purposeful motion only.">
          <motion.div
            className="flex flex-wrap gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {["Ship faster", "Ship safer", "Ship together"].map((label) => (
              <motion.div key={label} variants={staggerItem}>
                <motion.div
                  variants={hoverLift}
                  initial="rest"
                  whileHover="hover"
                  className="w-48 rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <Text variant="bodyStrong">{label}</Text>
                  <Text variant="caption">Hover this card</Text>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </Section>

        <Section id="icons" title="Iconography" description="Lucide React — always pass an explicit size.">
          <div className="flex items-end gap-8">
            {Object.entries(iconSize).map(([key, size]) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <Settings size={size} className="text-text-secondary" />
                <Text variant="small" tone="muted">
                  {key} · {size}px
                </Text>
              </div>
            ))}
          </div>
        </Section>

        <Section id="buttons" title="Buttons">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add">
                <Plus />
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section id="forms" title="Form Controls">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-name">Full name</Label>
                <Input id="ds-name" placeholder="Ada Lovelace" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-role">Role</Label>
                <Select defaultValue="engineer">
                  <SelectTrigger id="ds-role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="manager">Engineering Manager</SelectItem>
                    <SelectItem value="admin">Platform Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-notes">Notes</Label>
                <Textarea id="ds-notes" placeholder="Optional context…" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Checkbox id="ds-checkbox" defaultChecked />
                <Label htmlFor="ds-checkbox">Notify me about deploys</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="ds-switch" defaultChecked />
                <Label htmlFor="ds-switch">Enable compact density</Label>
              </div>
              <RadioGroup defaultValue="dark" className="gap-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="ds-r-dark" />
                  <Label htmlFor="ds-r-dark">Dark</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="ds-r-light" />
                  <Label htmlFor="ds-r-light">Light</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="system" id="ds-r-system" />
                  <Label htmlFor="ds-r-system">System</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Section>

        <Section id="badges" title="Badges & Alerts">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Alert variant="info">
                <Info />
                <AlertTitle>Deployment scheduled</AlertTitle>
                <AlertDescription>Production release goes out at 4:00 PM UTC.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <TriangleAlert />
                <AlertTitle>Elevated error rate</AlertTitle>
                <AlertDescription>API error rate is above the 2% threshold.</AlertDescription>
              </Alert>
            </div>
          </div>
        </Section>

        <Section id="cards" title="Cards">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Build pipeline</CardTitle>
                <CardDescription>Last run 12 minutes ago</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active incidents</CardTitle>
                <CardDescription>0 open · all systems normal</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback>OK</AvatarFallback>
                </Avatar>
                <Text variant="caption">On-call: Jamie Fox</Text>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skeleton loading</CardTitle>
                <CardDescription>Placeholder state example</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section id="navigation" title="Navigation">
          <div className="flex flex-col gap-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">
                    <Home size={iconSize.xs} />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Pipelines</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>build-042</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-3">
                <Text tone="secondary">Overview panel content.</Text>
              </TabsContent>
              <TabsContent value="logs" className="pt-3">
                <Text tone="secondary">Logs panel content.</Text>
              </TabsContent>
              <TabsContent value="settings" className="pt-3">
                <Text tone="secondary">Settings panel content.</Text>
              </TabsContent>
            </Tabs>

            <Accordion className="w-full max-w-md">
              <AccordionItem value="a1">
                <AccordionTrigger>What is DevFlow Enterprise?</AccordionTrigger>
                <AccordionContent>
                  An engineering operations platform for managing pipelines, deployments, and
                  incidents.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="a2">
                <AccordionTrigger>Is this the whole app?</AccordionTrigger>
                <AccordionContent>
                  No — this route is only a design-system showcase, not a product page.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Section>

        <Section id="overlays" title="Overlays">
          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy to production</DialogTitle>
                  <DialogDescription>
                    This will roll out the latest build to all production regions.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm deploy</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>Open drawer</SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Pipeline settings</SheetTitle>
                  <SheetDescription>Configure triggers and notifications.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Actions <ChevronRight className="rotate-90" size={iconSize.xs} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Pipeline</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy size={iconSize.xs} /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell size={iconSize.xs} /> Notify team
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Info" />}>
                <Info size={iconSize.sm} />
              </TooltipTrigger>
              <TooltipContent>Tooltips use the dropdown/tooltip motion preset.</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Section id="data" title="Data Display">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pipeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>web-frontend</TableCell>
                <TableCell>
                  <Badge variant="success">
                    <Check size={iconSize.xs} /> Passed
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-text-secondary">2m 14s</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>api-gateway</TableCell>
                <TableCell>
                  <Badge variant="warning">Flaky</Badge>
                </TableCell>
                <TableCell className="font-mono text-text-secondary">4m 02s</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>infra-terraform</TableCell>
                <TableCell>
                  <Badge variant="destructive">Failed</Badge>
                </TableCell>
                <TableCell className="font-mono text-text-secondary">0m 48s</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Separator className="my-4" />
        <Text variant="small" tone="muted" className="pb-12">
          DevFlow Enterprise Design System — Foundation only. No business logic, no pages beyond
          this showcase.
        </Text>
      </Container>
    </div>
  );
}
