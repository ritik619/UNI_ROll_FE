'use client';

import { AgentsRoleGuard } from 'src/sections/agents/role-guard';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Props) {
    return <AgentsRoleGuard>{children}</AgentsRoleGuard>;
} 