'use client';

import { AudioLinesIcon } from 'lucide-react';
import { InputGroupButton } from '@/components/ui/input-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

export function RecordButton() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InputGroupButton
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          data-active={voiceEnabled}
          className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
          aria-pressed={voiceEnabled}
          size="icon-sm"
        >
          <AudioLinesIcon />
        </InputGroupButton>
      </TooltipTrigger>
      <TooltipContent>Voice Mode</TooltipContent>
    </Tooltip>
  );
}
