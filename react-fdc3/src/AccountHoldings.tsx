import { Context, DesktopAgent } from '@glue42/fdc3';
import { Button, Paper, Stack } from '@mui/material';
import { useEffect, useState, useRef, useMemo } from 'react';
import useJoinChannel from './hooks/useJoinChannel';
import ChannelSelectorWidget from './ChannelSelector';
import useChannels from './hooks/useChannels';

interface Security {
  id: string;
  name: string;
  ticker: string;
}

const accountHoldings: Record<string, Security[]> = {
  '37142': [
    { id: '123', name: 'Security 1', ticker: 'SEC1' },
    { id: '456', name: 'Security 2', ticker: 'SEC2' },
  ],
  '90100': [
    { id: '123', name: 'Security 1', ticker: 'SEC1' },
    { id: '8546', name: 'Security 4', ticker: 'SEC4' },
  ],
  '42841': [
    { id: '546', name: 'Security 68', ticker: 'SEC68' },
    { id: '946', name: 'Security 734', ticker: 'SEC734' },
  ],
};

const AccountHoldings = () => {
  const fdc3 = useRef<DesktopAgent>();
  const [fdc3Ready, setFdc3Ready] = useState(false);
  const [initComplete, setInitComplete] = useState(false);
  const [accountId, setAccountId] = useState<string>('');
  const channels = useChannels(fdc3.current)
  const joinChannel = useJoinChannel(fdc3.current)

  const _ready = () => {
    fdc3.current = window.fdc3;
    setFdc3Ready(true);
  };

  useEffect(() => {
    if (window.fdc3) {
      _ready();
    } else {
      window.addEventListener('fdc3Ready', _ready);
    }
  }, []);

  useEffect(() => {
    if (!fdc3Ready || !fdc3.current || initComplete) {
      return;
    }
    (async () => {
      try {
        fdc3.current?.addIntentListener('ViewHoldings', (context: Context) => {
          console.log('ViewHoldings intent handler', context);
          const accountId = context.id?.accountId || 0;
          setAccountId(accountId);
        });

        setInitComplete(true);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [fdc3Ready, initComplete]);

  const holdings = useMemo(() => accountHoldings[accountId], [accountId]);

  return (
    <>
    <div className="px-3 py-1">
        <ChannelSelectorWidget
            channels={channels}
            onChannelSelected={joinChannel}
        />
    </div>
      {holdings && (
        <Stack spacing={2}>
          {holdings.map((instrument) => (
            <Paper key={instrument.id} sx={{ padding: 2 }} variant="outlined">
              <Button
                variant="text"
                onClick={() => {}}
              >
                {instrument.name}
              </Button>
            </Paper>
          ))}
        </Stack>
      )}
      {!holdings && <div>Please select an account to view holdings</div>}
    </>
  );
};

export default AccountHoldings;