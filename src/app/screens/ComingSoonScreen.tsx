import React from 'react';

import { AppHeader, ScreenScaffold, StateView } from '../../core/ui';

/** Dashboard, Media Library and More are outside this build's scope. */
export function ComingSoonScreen({ title }: { title: string }) {
  return (
    <ScreenScaffold header={<AppHeader title={title} />}>
      <StateView
        state="empty"
        title="Coming soon"
        message={`${title} isn’t available yet.`}
      />
    </ScreenScaffold>
  );
}
