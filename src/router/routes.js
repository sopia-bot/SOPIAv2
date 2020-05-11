const routes = [
	{
		path: '/',
		name: 'Home',
	},
	{
		path: '/loading/',
		name: 'Loading',
		component: () => import('@/views/Loading.vue')
	},
	{
		path: '/spoon/:popup(.*)',
		name: 'Spoon',
		component: () => import('@/views/Spoon.vue')
	},
	{
		path: '/dashboard/',
		name: 'Dashboard',
		component: () => import('@/views/Dashboard.vue')
	},
	{
		path: '/code/:folder/:file(.*)',
		name: 'Code',
		component: () => import('@/views/Code.vue')
	},
	{
		path: '/code/:folder/',
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
