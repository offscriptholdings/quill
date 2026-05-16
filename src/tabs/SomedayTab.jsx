import React from 'react';
import ViewHeader from '../components/ViewHeader';

export default function SomedayTab() {
  return (
    <div>
      <ViewHeader
        kicker="WAITING ROOM"
        title="Someday"
        dropCap="S"
      />
      <div style={{
        padding: '40px 16px', textAlign: 'center',
        fontFamily: 'Newsreader, serif', fontSize: 16, fontStyle: 'italic',
        color: '#948A78',
      }}>
        Tasks without a schedule live here.
      </div>
    </div>
  );
}
