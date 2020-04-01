const routes = [
	{
		path: '/',
		name: 'Home',
	},
	{
		path: '/spoon/',
		name: 'Spoon',
		component: () => import('@/views/Spoon.vue')
	},
	{
		path: '/dashboard/',
		name: 'Dashboard',
		component: () => import('@/views/Dashboard.vue')
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
	{
		path: '/login/',
		name: 'Login',
		component: () => import('@/views/Login.vue'),
	}
];

export default routes;
