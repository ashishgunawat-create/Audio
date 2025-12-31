export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  audioBuffer: AudioBuffer | null;
  duration: number;
  currentTime: number;
}

export interface ScriptSegment {
  text: string;
}

export const INITIAL_SCRIPT = `[0–5s | HOOK | slow, serious]
They told you… you’re too late.

[5–10s | pause, curious]
But if it’s really too late…
why does quitting still hurt?

[10–15s | calm, honest]
You wake up tired.
Not from work…
but from dreams you never tried.

[15–20s | relatable, soft]
You scroll.
You compare.
Everyone looks ahead…
while you feel stuck at zero.

[20–25s | low, emotional]
And that silence at night?
That’s your potential asking for a chance.

[25–30s | shift in energy]
Listen carefully.

[30–35s | confident truth]
No one posts the nights they cried.
No one uploads the days they failed.

[35–40s | reassuring]
Your Chapter One
is not supposed to look like
someone else’s Chapter Twenty.

[40–45s | strong, proud]
Gen Z isn’t lazy.

[45–50s | powerful, real]
Gen Z is overloaded.
But still dreaming.
And that matters.

[50–55s | motivating]
Start messy.
Start scared.
Just start.

[55–60s | inspiring close | slight pause]
Because one day…
this exact moment
will be the reason
you didn’t give up.`;