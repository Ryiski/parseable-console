import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import { NAVBAR_WIDTH } from '@/constants/theme';
import { AppShell } from '@mantine/core';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: FC = () => {
	return (
		<AppShell
			padding={0}
			navbar={<Navbar width={{ base: NAVBAR_WIDTH }} />}
			header={<Header p="xs" />}
			styles={() => ({
				main: {
					display: 'flex',
				},
			})}>
			<Outlet />
		</AppShell>
	);
};

export default MainLayout;