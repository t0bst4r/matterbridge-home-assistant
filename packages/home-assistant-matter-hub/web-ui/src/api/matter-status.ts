import { MatterStatus } from '@home-assistant-matter-hub/shared-models';

import { RequestResponse } from './request.ts';

const mockedStatus: MatterStatus = {
  isCommissioned: true,
  fabrics: [
    {
      id: 'Alexa-1',
      name: 'Alexa',
      activeSessions: 1,
    },
    {
      id: 'Google-1',
      name: 'Google',
      activeSessions: 2,
    },
    {
      id: 'Apple-1',
      name: 'Apple',
      activeSessions: 3,
    },
  ],
};

export function useMatterStatus(): RequestResponse<MatterStatus> {
  return [false, mockedStatus, undefined];
}
