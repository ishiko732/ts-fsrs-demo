'use client';
import { DeckAppsAtom } from '@/atom/decks/apps';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Apps } from '@lib/apps';
import { TAppData, TAppProps } from '@lib/apps/types';
import { useAtom, useAtomValue } from 'jotai';
import { Box, PackageMinus, PackagePlus } from 'lucide-react';

export function InstallAppsDialog() {
  const deckApps = useAtomValue(DeckAppsAtom);
  const deckId = useAtomValue(deckApps.deckId);
  const [open, setOpen] = useAtom(deckApps.openInstall);
  const [installedApps, setInstalledApps] = useAtom(deckApps.apps);
  const apps = Apps;

  const installHandler = async (service: string, params: object) => {
    setInstalledApps((prev) => {
      prev.set(service, params);
      return new Map(prev);
    });
    return true;
  };

  const removeHandler = async (service: string) => {
    setInstalledApps((prev) => {
      prev.delete(service);
      return new Map(prev);
    });
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className='sm:max-w-[460px] max-h-[80%] overflow-y-auto'
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Install Apps</DialogTitle>
          <DialogDescription>
            Install apps to your deck to extend its functionality.
          </DialogDescription>
        </DialogHeader>
        <Accordion type='single' collapsible className='w-full p-4'>
          {Apps.map((app) => (
            <AppItem
              key={app.name}
              app={app}
              props={{
                install: installedApps.has(app.name),
                params: installedApps.get(app.name) ?? null,
                installHandler: installHandler.bind(null, app.name),
                removeHandler: removeHandler.bind(null, app.name),
              }}
            />
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}

function AppItem({ app, props }: { app: TAppData } & { props: TAppProps }) {
  return (
    <AccordionItem value={app.name}>
      <AccordionTrigger>
        <div className='flex justify-between items-stretch gap-2'>
          <div>
            <Box />
          </div>
          <div>{app.name}</div>
          <div>{props.install ? <Badge>Installed</Badge> : null}</div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {app.description ? <div className='pb-2'>{app.description}</div> : null}
        {app.component(props)}
      </AccordionContent>
    </AccordionItem>
  );
}
