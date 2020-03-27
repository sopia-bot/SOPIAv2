<template>
	<div class="wrapper">
		<div class="particle-wrapper">
			<vue-particles
				color="#f1f1f1"
				:particleOpacity="0.6"
				:particlesNumber="200"
				shapeType="circle"
				:particleSize="1"
				linesColor="#acacac"
				:linesWidth="1"
				:lineLinked="true"
				:lineOpacity="0.0"
				:linesDistance="350"
				:moveSpeed="1"
				:hoverEffect="true"
				hoverMode="grab"
				:clickEffect="true"
				clickMode="repulse">
			</vue-particles>
			<side-bar class="custom">
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

				<!--
				<template slot="links-after">
					<hr class="my-3">
					<ul class="navbar-nav mb-md-3">
						<li class="nav-item">
							<div class="row">
								<div class="col text-right">
									<a class="close-sidebar-icon"
									   href="#"
									   @click="toggle">
										<i v-if="$sidebar.isMinimized" class="ni ni-bold-right"></i>
										<i v-else class="ni ni-bold-left"></i>
									</a>
								</div>
							</div>
						</li>
					</ul>
				</template>
				-->

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

.main-content {
	min-height: 100vh;
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
.close-sidebar-icon {
	padding: 0.675rem 1.5rem;
	color: #ced4da;
}
.close-sidebar-icon:hover {
	color: #adb5bd; }
</style>
<script>

export default {
	components: {
	},
	methods: {
		toggle() {
			this.$sidebar.toggleMinimize();
		},
		sidebarClose() {
			if ( !this.$sidebar.isMinimized && window.innerWidth < 1200 ) {
				this.$sidebar.toggleMinimize();
			}
		}
    },
	mounted() {
	},
	data() {
		return {
			sideItems: [
				{
					link: {
						name: "Dashboards",
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
			]
		}
	}
}
</script>
