const routes = [
	{
		path: '/',
		name: 'Home',
		redirect: '/dashboard/',
	},
	{
		path: '/dashboard/',
		name: 'Dashboard',
		component: () => import('@/views/Home.vue')
	},
	{
		path: '/code/',
		name: 'Code',
		component: () => import('@/views/Code.vue')
	},
	{
		path: '/spoorchat/',
		name: 'Spoor Chat',
		component: () => import('@/views/SpoorChat.vue')
	},
	{
		path: '/setting/',
		name: 'Setting',
		component: () => import('@/views/Setting.vue')
	},
	{
		path: '/bundle/',
		name: 'Bundle',
		component: () => import('@/views/Bundle.vue')
	},
];

export default routes;
