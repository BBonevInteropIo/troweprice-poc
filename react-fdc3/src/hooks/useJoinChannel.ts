import { DesktopAgent } from "@glue42/fdc3";
import { NO_CHANNEL_VALUE } from "../constants";
import { useCallback } from "react";

export default function useJoinChannel(fdc3?: DesktopAgent) {
   const onChannelSelected = useCallback((channel: {value: string}) => {
    if (!fdc3) {
          return;
        }

      joinChannel(fdc3)(channel)
  }, [fdc3])

  return (channel: {value: string}) => onChannelSelected(channel)
}

export const joinChannel =  (fdc3: DesktopAgent) => async ({ value: channelId }: {value: string}) => {
    // Leave the current Channel when the user selects "No Channel".
    if (channelId === NO_CHANNEL_VALUE) {
      const currentChannel = await fdc3.getCurrentChannel()
      if (currentChannel) {
        await fdc3.leaveCurrentChannel()
      }
    } else {
        // Join the Channel selected by the user.
        fdc3.joinUserChannel(channelId).catch(console.error);
    };
};
