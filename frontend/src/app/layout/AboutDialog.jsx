import { ExternalLink, Github, Globe, Linkedin } from "@/shared/lib/icons";
import configService from "@/services/configService";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";

const LINKS = [
  { href: "https://fiopans1.com", label: "Website", icon: Globe },
  { href: "https://www.linkedin.com/in/fiopans1/", label: "LinkedIn", icon: Linkedin },
  { href: "https://github.com/fiopans1", label: "GitHub", icon: Github },
];

export default function AboutDialog({ open, onOpenChange }) {
  const appName = configService.getAppName();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>About {appName}</DialogTitle>
          <DialogDescription className="sr-only">
            Application information and project links
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="flex items-center gap-4">
            <img
              src="/favicon.png"
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-md"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{appName}</p>
              <p className="text-xs text-muted-foreground">
                Self-hosted task management for individuals and teams.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="outline">
                  Version {configService.getAppVersion()}
                </Badge>
                <Badge tone="brand">{configService.getAppLicense()}</Badge>
              </div>
            </div>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            Tasks, lists, calendar planning and time tracking in one place. Your
            data stays on the server you run.
          </p>

          <Separator />

          <div className="grid gap-2 sm:grid-cols-3">
            {LINKS.map(({ href, label, icon: IconComponent }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <IconComponent size={15} aria-hidden="true" />
                  {label}
                </span>
                <ExternalLink size={13} className="text-muted-foreground" aria-hidden="true" />
              </a>
            ))}
          </div>

          <p className="text-2xs text-muted-foreground">
            © {new Date().getFullYear()} {appName}. Created by fiopans1.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
