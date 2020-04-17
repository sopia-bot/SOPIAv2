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
					<div class="col-lg-6" @click="modal.restore = true;" style="cursor: pointer">
						<card gradient="danger" class="border-0">
							<div class="row justify-content-center align-items-center">
								<div class="col">
									<h5 class="card-title h3 text-uppercase mb-0 text-white">{{ $t('setting.restore-setting') }}</h5>
								</div>
								<div class="col-auto">
									<div class="icon icon-shape bg-white text-dark rounded-circle shadow">
										<i class="fas fa-tools"></i>
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

				<!-- S:Admins -->
				<div class="row ma-0">
					<div class="col col-12 px-0">
						<admin-setting-form></admin-setting-form>
					</div>
				</div>
				<!-- E:Admins -->
			</div>
		</div>
		<!-- E:Row -->
		<!-- S:Confirm -->
		<modal :show.sync="modal.restore">
            <h6 slot="header" class="modal-title" id="modal-title-default">{{ $t('setting.restore-setting') }}</h6>

            <p>{{ $t('setting.confirm-restore') }}</p>

            <template slot="footer">
				<VueLoadingButton
					class="btn base-button btn-danger"
					@click.native="restoreSetting"
					:loading="loading.restore"
					>OK</VueLoadingButton>
                <base-button type="link" class="ml-2" @click="modal.restore = false">Cancel</base-button>
            </template>
        </modal>
		<!-- E:Confirm -->
	</div>
	<!-- E:Container -->
</template>
<script>
import SopiaSettingForm from './Settings/SopiaSetting.vue';
import PerformSettingForm from './Settings/PerformSetting.vue';
import AdminSettingForm from './Settings/AdminSetting.vue';
import UserCard from './Settings/UserCard.vue';
import electron from 'electron';
import VueLoadingButton from 'vue-loading-button';
import path from 'path';
import fs from 'fs';

export default {
	name: 'Setting',
	components: {
		SopiaSettingForm,
		PerformSettingForm,
		AdminSettingForm,
		UserCard,
		VueLoadingButton,
	},
	methods:{
		openHome() {
			const { shell } = electron;
			shell.openExternal('https://sopia-bot.github.io/');
		},
		async restoreSetting() {
			this.loading.restore = true;

			const files = await this.$db().get('/11-app/files/');
			const cfs = async (obj, p) => {
				const fl = Object.keys(obj);

				this.stepLength += fl.length;
				for (let i=0;i<fl.length;i++) {
					const f = fl[i];
					const o = obj[f];
					const target = path.join(p, f);
					if ( o.ext ) {
						// file
						const file = `${target}.${o.ext}`;
						if ( fs.existsSync(file) ) {
							fs.unlinkSync(file);
						}
					} else {
						// directory
						if ( fs.existsSync(target) ) {
							await cfs(obj[f], target);
						}
					}
				}
			};
			await cfs(files, this.up());
			this.$remote().getGlobal('clearSession')();
			this.loading.restore = false;
			this.$assign('/loading/');
		},
	},
	data() {
		return {
			modal: {
				restore: false,
			},
			loading: {
				restore: false,
			},
		};
	},
}
</script>
