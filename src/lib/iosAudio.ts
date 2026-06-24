type AudioSessionType = "auto" | "ambient" | "playback" | "play-and-record" | "transient";

interface AudioSessionLike {
  type: AudioSessionType;
}

interface NavigatorWithAudioSession extends Navigator {
  audioSession?: AudioSessionLike;
}

export function prepareAudioForPlayback(): void {
  if (typeof window === "undefined") {
    return;
  }

  const navigatorWithAudioSession = navigator as NavigatorWithAudioSession;

  if (navigatorWithAudioSession.audioSession === undefined) {
    return;
  }

  try {
    navigatorWithAudioSession.audioSession.type = "playback";
  } catch {
    // Ignore unsupported or read-only implementations.
  }
}
