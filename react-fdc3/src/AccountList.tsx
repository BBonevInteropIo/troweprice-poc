import { useRef, useState, useEffect } from 'react';
import { AppIntent, DesktopAgent } from '@glue42/fdc3';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const portfolioContext = 'fdc3.portfolio';

const accounts = [
  { name: 'CAP', id: '37142' },
  { name: 'GCF', id: '90100' },
  { name: 'MCG', id: '42841' },
];

const AccountList = () => {
  const fdc3 = useRef<DesktopAgent>();
  const [fdc3Ready, setFdc3Ready] = useState(false);
  const [initComplete, setInitComplete] = useState(false);
  const [availableIntents, setAvailableIntents] = useState<Array<AppIntent>>([]);

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
    console.log({ fdc3Ready, initComplete, fdc3: fdc3.current });
    if (!fdc3Ready || !fdc3.current || initComplete) {
      return;
    }
    (async () => {
      try {
        const intents = await fdc3.current?.findIntentsByContext({ type: portfolioContext });
        setAvailableIntents(intents || []);
      } catch (e) {
        console.log(e);
      }

      setInitComplete(true);
    })();
  }, [fdc3Ready, initComplete]);

  const raiseIntent = async (intent: AppIntent, accountId: string) => {
    if (!fdc3.current) {
      return;
    }
    try {
      const resolution = await fdc3.current.raiseIntent(intent.intent.name, { type: portfolioContext, id: { accountId } });
      console.log('got resolution', resolution);
      try {
        const result = await resolution.getResult();
        if (result && result.broadcast) {
          //detect whether the result is Context or a Channel
          console.log(`${resolution.source.appId} returned a channel with id ${result.id}`);
        } else if (result) {
          console.log(`${resolution.source.appId} returned data: ${JSON.stringify(result)}`);
        } else {
          console.log(`${resolution.source.appId} didn't return anything`);
        }
      } catch (e) {
        console.error(`${resolution.source.appId} returned a result error: ${e}`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Stack spacing={2}>
        {accounts.map((account) => (
          <Paper key={account.id} sx={{ padding: 2 }} variant="outlined">
            <Button
              variant="text"
              onClick={() => {}}
            >
              {account.name}
            </Button>
            <Box sx={{ display: 'flex' }} className="actions">
              {availableIntents.map((intent) => (
                <Button
                  key={intent.intent.name}
                  className="account-actions"
                  sx={{ margin: 1, textTransform: 'none' }}
                  variant="contained"
                  size="small"
                  onClick={() => raiseIntent(intent, account.id)}
                >
                  {intent.intent.name}
                </Button>
              ))}
            </Box>
          </Paper>
        ))}
      </Stack>
    </>
  );
};

export default AccountList;