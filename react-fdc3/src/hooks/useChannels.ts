import { Channel, DesktopAgent } from "@glue42/fdc3";
import { useEffect, useState } from "react";

export default function useChannels(fdc3?: DesktopAgent) {
  const [channels, setChannels] = useState<Channel[]>([])

   useEffect(() => {
    (async () => {
      try {
        if (!fdc3) {
          return;
        }

        const channels = await fdc3.getUserChannels()

        setChannels(channels)
      } catch (e) {
        console.log(e);
      }
    })();
    
  }, [fdc3, setChannels])

  return channels
}