<template>
	<div class="wrapper">
		<base-button
			type="secondary"
			size="sm"
			class="nav-toggle-btn d-xl-none"
			@click="toggle"
			:style="{ left: sideOpen ? '250px' : '0px' }"
			v-if="!isLoginPage">
			<i class="ni ni-bold-left" v-if="sideOpen"></i>
			<i class="ni ni-bold-right" v-else></i>
		</base-button>
		<div class="particle-wrapper">
			<vue-particles
				color="#f1f1f1"
				:particleOpacity="0.6"
				:particlesNumber="0"
				shapeType="circle"
				:particleSize="1"
				linesColor="#acacac"
				:linesWidth="1"
				:lineLinked="true"
				:lineOpacity="0.0"
				:linesDistance="0"
				:moveSpeed="1"
				:hoverEffect="true"
				hoverMode="grab"
				:clickEffect="true"
				clickMode="repulse">
			</vue-particles>
			<side-bar class="custom" v-if="!isLoginPage">
				<template slot-scope="props" slot="links">
					<sidebar-item
						v-for="(item, idx) in sideItems"
						:link="item.link"
						:key="idx">
						<template v-if="Array.isArray(item.sub)">
							<sidebar-item
								v-for="(sitem, sidx) in item.sub"
								:link="sitem"
								:key="'sub-' + idx + '-' + sidx"></sidebar-item>
						</template>
					</sidebar-item>
				</template>
			</side-bar>
			<div class="main-content" @click="sidebarClose">
				<fade-transition :duration="200" origin="center top" mode="out-in">
					<!-- your content here -->
					<router-view></router-view>
				</fade-transition>
			</div>
		</div>
	</div>
</template>
<script>

export default {
	components: {
	},
	methods: {
		toggle() {
			this.sideOpen = !this.sideOpen;
			this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
		},
		sidebarClose() {
			if ( this.$sidebar.showSidebar && window.innerWidth < 1200 ) {
				this.sideOpen = false;
				this.$sidebar.displaySidebar(false);
			}
		},
		checkUserValid() {
			const cfg = this.$cfg('app');
			const licenseTag = cfg.get('license.id');
			const userTag = cfg.get('user.tag');
			return (userTag || licenseTag) ? userTag === licenseTag : false;
		},
    },
	watch: {
		'$route' (to, from) {
			if ( to.path === "/" ) {
				if ( this.checkUserValid() ) {
					this.$assign('/spoon/');
				} else {
					this.$assign('/login/');
				}
			}

			if ( to.name === "Login" ) {
				this.isLoginPage = true;
			} else {
				this.isLoginPage = false;
			}

			this.sideOpen = false;
		}
	},
	mounted() {
		console.log(this.$sidebar)
		if ( this.$route.path === "/" ) {
			if ( this.checkUserValid() ) {
				this.$assign("/spoon/");
			} else {
				this.$assign("/login/");
			}
		}
	},
	data() {
		return {
			isLoginPage: false,
			sideOpen: false,
			sideItems: [
				{
					link: {
						name: "Spoon",
						icon: "fa fa-utensil-spoon",
						path: "/spoon/",
					},
				},
				{
					link: {
						name: "Dashboard",
						icon: "fa fa-home",
						path: "/dashboard/",
					},
				},
				{
					link: {
						name: "Code",
						icon: "fa fa-code",
						path: "/code/",
					}
				},
				{
					link: {
						name: "Spoor Chat",
						icon: "fa fa-headset",
						path: "/spoorchat/",
					}
				},
				{
					link: {
						name: "Setting",
						icon: "fa fa-cogs",
						path: "/setting/",
					}
				},
				{
					link: {
						name: "Bundle",
						icon: "fa fa-cloud",
						path: "/bundle/",
					}
				},
			],
			sidebar: "fas fa-bars",
		}
	}
}
</script>
<style scope>
div.sidenav.custom li.nav-item a.nav-link span.nav-link-text {
	margin-left: 1rem;
}
div.sidenav.custom li.nav-item a.nav-link.active span.nav-link-text {
	margin-left: calc( 1rem - 3.5px );
}
.ma-0 {
	margin: 0;
}
.pa-0 {
	padding: 0;
}
.particle-wrapper {
	background-color: rgba(0, 0, 0, 0.5);
	min-height: 100vh;
}
.wrapper {
	background-image: url('assets/imgs/wallpaper.jpg');
	background-size: cover;
}
#particles-js {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.nav-toggle-btn {
	border-radius: 0;
	position:absolute;
	top:0;
	z-index:100;
}

.nav-toggle-btn:hover {
	-webkit-transform: unset;
	transform: unset;
}
</style>
