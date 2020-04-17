<template>
	<!-- S:Container -->
	<div class="container-fluid pt-5">
		<!-- S:Row -->
		<div class="row">
			<div class="col-xl-4 order-xl-2 pt-6">
				<user-card></user-card>
			</div>
			<div class="col-xl-8 order-xl-1">
				<!-- S:Row -->
				<div class="row">
					<div class="col-lg-6">

					<card gradient="default" class="border-0">
						<div class="row">
							<div class="col">
								<h5 class="card-title text-uppercase text-muted mb-0 text-white">{{ $t('setting.github-connect') }}</h5>
								<span class="h2 font-weight-bold mb-0 text-success"> 연동 됨 </span>
							</div>
							<div class="col-auto">
								<div class="icon icon-shape bg-white text-dark rounded-circle shadow">
									<i class="fab fa-github-alt"></i>
								</div>
							</div>
						</div>
						<!--
						<p class="mt-3 mb-0 text-sm">
							<span class="text-white mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
							<span class="text-nowrap text-light">Since last month</span>
						</p>
						-->
					</card>

					</div>
					<div class="col-lg-6" @click="openHome" style="cursor: pointer">
						<!-- S:Card -->
						<card gradient="success" class="border-0">
							<div class="row">
								<div class="col">
									<h5 class="card-title text-uppercase mb-0 text-default">{{ $t('setting.sopia-web') }}</h5>
									<span class="h2 font-weight-bold mb-0 text-white">{{ $t('setting.view') }}</span>
								</div>
								<div class="col-auto">
									<div class="icon icon-shape bg-white text-dark rounded-circle shadow">
									<i class="ni ni-spaceship"></i>
									</div>
								</div>
							</div>
							<!--
							<p class="mt-3 mb-0 text-sm">
								<span class="text-white mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
								<span class="text-nowrap text-light">Since last month</span>
							</p>
							-->
						</card>
						<!-- E:Card -->
					</div>
				</div>
				<!-- E:Row -->
				<!-- S:Row -->
				<div class="row ma-0">
					<div class="col col-12 col-lg-6 pl-0 pr-0 pr-lg-3">
						<sopia-setting-form></sopia-setting-form>
					</div>
					<div class="col col-12 col-lg-6 pl-0 pl-lg-3 pr-0">
						<perform-setting-form></perform-setting-form>
					</div>
				</div>
				<!-- E:Row -->
			</div>
		</div>
		<!-- E:Row -->
	</div>
	<!-- E:Container -->
</template>
<script>
import SopiaSettingForm from './Settings/SopiaSetting.vue';
import PerformSettingForm from './Settings/PerformSetting.vue';
import UserCard from './Settings/UserCard.vue';
import electron from 'electron';

export default {
	name: 'Setting',
	components: {
		SopiaSettingForm,
		PerformSettingForm,
		UserCard,
	},
	methods:{
		openHome() {
			const { shell } = electron;
			shell.openExternal('https://sopia-bot.github.io/');
		}
	},
	data() {
		return {
		};
	},
}
</script>
