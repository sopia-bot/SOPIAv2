<template>
    <div class="container" style="height:100vh">
        <div class="row align-items-center justify-content-center" style="height: 100%">
            <div class="col-lg-5 col-md-7">
				<!-- S:Card -->
                <div class="card bg-secondary border-0 mb-0">
                    <div class="card-header px-lg-4 bg-transparent pb-3">
                        <div class="text-muted text-center mt-2 mb-3">
                            <small>{{ $t('login.input-serial') }}</small>
                        </div>
                        <base-input alternative
                                    name="Serial"
                                    prepend-icon="ni ni-key-25"
                                    v-model="form.serial"
                                    :placeholder="$t('login.serial')">
                        </base-input>
                    </div>
					<!-- S:Login Success -->
                    <div v-if="isLogin" class="card-body px-lg-4 py-lg-3">
						<div class="row align-items-center">
							<div class="col text-center">
								<a href="#" @click="pmodal = true">
									<img
										ref="user-profile"
										class="rounded-circle ma-0"
										:style="{ backgroundImage: 'url(' + userData.profile_url + ')' }"
										style="width: 150px; height: 150px; background-position: center; background-repeat: no-repeat; background-size: cover" />
								</a>
							</div>
						</div>
						<div class="pt-4 text-center">
							<h5 class="h3 title">
								<span class="d-block mb-1">{{ userData.nickname }}</span>
								<small class="h4 font-weight-light text-muted">{{ userData.tag }}</small>
							</h5>
						</div>
                    </div>
					<!-- E:Login Success -->
					<!-- S:Login Form -->
                    <div v-else class="card-body px-lg-4 py-5">
                        <div class="text-center text-muted mb-4">
							<small>{{ $t('login.spoon-login') }}</small>
                        </div>
						<div class="mb-3">
							<base-input alternative
										name="id"
										prepend-icon="ni ni-circle-08"
										v-model="form.id"
										placeholder="Id">
							</base-input>
						</div>

						<div class="mb-3">
							<base-input alternative
										class="mb-3"
										name="Password"
										prepend-icon="ni ni-lock-circle-open"
										type="password"
										v-model="form.passwd"
										placeholder="Password">
							</base-input>
						</div>
						<div class="text-center">
							<!--
							<base-button type="secondary" native-type="button" class="text-orange" @click="login">{{ $t('login.login') }}</base-button>
							<base-button type="secondary" native-type="button" class="text-info" @click="snsLogin('facebook')">Facebook</base-button>
							<base-button type="secondary" native-type="button" class="text-blue" @click="snsLogin('google')">Google</base-button>
							-->
							<VueLoadingButton
								class="btn base-button btn-secondary text-orange"
								@click.native="login"
								:loading="loading.login"
								>{{ $t('login.login') }}</VueLoadingButton>

							<VueLoadingButton
								class="btn base-button btn-secondary text-info"
								@click.native="snsLogin('facebook')"
								:loading="loading.facebook"
								>Facebook</VueLoadingButton>
							<VueLoadingButton
								class="btn base-button btn-secondary text-orange"
								@click.native="snsLogin('google')"
								:loading="loading.google"
								>Google</VueLoadingButton>
						</div>
                    </div>
					<!-- E:Login Form -->

					<!-- S:Footer -->
					<div v-if="isLogin" class="card-footer text-center bg-transparent">
						<div>
							<!--
							<base-button @click="logout" type="danger" native-type="button"> {{ $t('login.logout') }}</base-button>
							<base-button @click="certification" type="success" class="ml-auto" native-type="button">{{ $t('login.auth') }}</base-button>
							-->
							<VueLoadingButton
								class="btn base-button btn-danger text-white"
								@click.native="logout"
								:loading="false"
								>{{ $t('login.logout') }}</VueLoadingButton>
							<VueLoadingButton
								class="btn base-button btn-success text-white"
								@click.native="certification"
								:loading="loading.cert"
								>{{ $t('login.auth') }}</VueLoadingButton>
						</div>
					</div>
					<!-- E:Footer -->
                </div>
				<!-- S:Card -->
            </div>
        </div>
		<!-- S:Profile Image Modal -->
		<modal :show.sync="pmodal" class="custom">
			<img :src="userData.profile_url" class="img-center" style="width:100%; border-radius:5px;">
		</modal>
		<!-- E:Profile Image Modal -->
		<!-- S:Notification -->
		<modal :show.sync="noti.show"
               gradient="danger"
               modal-classes="modal-danger modal-dialog-centered">
            <h6 slot="header" class="modal-title" id="modal-title-notification">{{ noti.title }}</h6>

            <div class="py-3 text-center">
                <i class="ni ni-bell-55 ni-3x"></i>
				<h4 class="heading mt-4">{{ noti.main }}</h4>
				<p>{{ noti.sub }}</p>
            </div>

            <template slot="footer">
                <base-button type="link"
                             class="ml-auto text-white"
                             @click="noti.show = false">
                    Close
                </base-button>
            </template>
        </modal>
		<!-- S:Notification -->
    </div>
</template>
<script>
import VueLoadingButton from 'vue-loading-button';

export default {
	name: 'Login',
	components: {
		VueLoadingButton,
	},
	methods: {
		login() {
			this.loading.login = true;
			this.$s().login(this.form.id, this.form.passwd)
				.then(res => {
					this.loading.login = false;
					if ( res.result_code === 1 ) {
						// login success
						this.userData = res;
						this.isLogin = true;

						const cfg = this.$cfg('app');
						cfg.set('license.login.type', 'nomal');
						cfg.set('license.login.id', this.form.id);
						cfg.set('license.login.passwd', this.form.passwd);
						return;
					}
				})
				.catch(err => {
					this.loading.login = false;
					this.noti.title = this.$t('login.error.login-fail');
					this.noti.main = this.$t(err.message);
					this.noti.sub = "";
					this.noti.show = true;
				});
		},
		snsLogin(type) {
			this.loading[type] = true;
			this.$s().snsLogin(type)
				.then(res => {
					this.loading[type] = false;
					if ( res.result_code === 1 ) {
						this.userData = res;
						this.isLogin = true;

						
						const cfg = this.$cfg('app');
						cfg.set('license.login.type', type);
						return;
					}


					this.noti.title = res.ban_info.content;
					this.noti.main = res.ban_info.main;
					this.noti.sub = res.ban_info.sub;
					this.noti.show = true;
				})
				.catch(err => {
					this.loading[type] = false;
					/*
					this.noti.title = this.$t('login.error.login-fail');
					this.noti.main = this.$t(err.message);
					this.noti.sub = "";
					this.noti.show = true;
					*/
				});
		},
		logout() {
			this.$remote().getGlobal('clearSession')();
			this.userData = false;
			this.isLogin = false;
		},
        certification() {
			const serial = this.form.serial.trim();
			this.loading.cert = true;
            if ( !serial.match(/[A-Z]{4}-[A-Z]{4}-[A-Z]{4}-[0-9]{4}/) ) {
                this.noti.title = this.$t('login.error.serial-cert-fail');
                this.noti.main = "XXXX-XXXX-XXXX-XXXX";
                this.noti.sub = this.$t('login.error.invalid-serial');
				this.noti.show = true;
				this.loading.cert = false;
                return;
			}
			
			if ( this.userData && this.userData.grants && this.userData.grants.auth !== 1 ) {
				this.noti.title = this.$t('login.error.serial-cert-fail');
				this.noti.main = this.$t('login.error.not-auth-spoon');
				this.noti.sub = this.$t('login.error.auth-spoon');
				this.noti.show = true;
				this.loading.cert = false;
				return;
			}

            const reqUrl = `${this.$store.getters.fbUrl}/certSerial/${serial}`;
            this.$http({
                url: reqUrl,
                method: 'post',
                data: {
                    spoon_id: this.userData.tag,
                    mac: this.generateUUID(),
                }
            }).then(res => {
				this.loading.cert = false;
                const data = res.data;
                if ( data.result === true ) {
					// certification success
					const cfg = this.$cfg('app');

					// serial set
					cfg.set('license.id', this.userData.tag);
					cfg.set('license.serial', this.form.serial);

					// user set
					cfg.set('user', this.userData);

					this.$assign('/');
                } else {
                    this.noti.title = this.$t('login.error.cert-fail');
                    this.noti.main = data.msg;
                    this.noti.sub = "";
                    this.noti.show = true;
                }
            }).catch(err => {
				this.loading.cert = false;
			});
        },
	},
	mounted() {
	},
    data() {
        return {
            form: {
                id: '',
                passwd: '',
                serial: '',
            },
			userData: false,
			pmodal: false,
			noti: {
				show: false,
				title: "",
				main: "",
				sub: "",
			},
			loading: {
				login: false,
				facebook: false,
				google: false,
				cert: false,
			},
			isLogin: false,
        }
    }
}
</script>
<style scope>
.custom .modal-body {
	padding: 0;
}
.btn {
	font-size: 0.875rem !important;
	padding: 0.7rem 1rem !important;
}
</style>
