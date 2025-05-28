'use client';

import { useAuthContext } from 'src/auth/hooks';
import { RoleBasedGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export function AgentsRoleGuard({ children }: Props) {
    const { user } = useAuthContext();

    return (
        <RoleBasedGuard
            currentRole={user?.role ?? 'user'}
            acceptRoles={['admin']}
        >
            {children}
        </RoleBasedGuard>
    );
} 