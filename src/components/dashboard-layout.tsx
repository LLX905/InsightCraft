'use client';

// This component is now a wrapper for the main tabbed interface if needed,
// but for the simplified 2-tab requirement, we can keep it as a simple shell.

import * as React from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
