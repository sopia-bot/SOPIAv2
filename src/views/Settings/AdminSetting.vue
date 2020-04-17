<template>
	<div>
		<div class="card">
			<!-- Card header -->
			<div class="card-header">
				<!-- Title -->
				<h5 class="h3 mb-0">{{ $t('setting.admin.title') }}</h5>
			</div>
			<!-- S:Card Body -->
			<div class="card-body">
				<!-- S:List group -->
				<ul class="list-group list-group-flush list my-0">
					<!-- S:Admins -->
					<li v-for="admin in admins"
						:key="admin.tag"
						class="list-group-item px-0">
						<div class="row align-items-center">
							<div class="col-auto">
								<!-- Avatar -->
								<a href="#!" class="avatar avatar-xl rounded-circle"
									@click="profile_url = admin.profile_url; modal.picture = true;">
									<img 
										:style="{ backgroundImage: 'url(' + admin.profile_url + ')' }"
										class="rounded-circle ma-0"
										style="height: 100%; background-position: center; background-repeat: no-repeat; background-size: cover;">
								</a>
							</div>
							<div class="col ml--2">
								<h4 class="mb-0">
									<a href="#!">{{admin.nickname}}</a>
									<p><small class="text-muted mb-2">{{ admin.tag }}</small></p>
								</h4>
							</div>
							<div class="col-auto">
								<button @click="delAdmin(admin)" type="button" class="btn btn-sm btn-danger">Delete</button>
							</div>
						</div>
					</li>
					<!-- E:Admins -->
					<li class="list-group-item px-0 add-admin-box" @click="modal.search = true">
						<div class="row align-items-center py-3">
							<div class="col col-12 text-center">
								<i class="fas fa-plus-circle"></i>
								Add Admins
							</div>
						</div>
					</li>
				</ul>
				<!-- P:List group -->
			</div>
			<!-- E:Card Body -->
		</div>
		<!-- S:Search User -->
		<modal :show.sync="modal.search">
            <h6 slot="header" class="modal-title" id="modal-title-default">{{ $t('setting.admin.search-user') }}</h6>

			<div class="row ma-0">
				<div class="col col-12 px-0">
					<base-input group>
						<input type="text" class="form-control" v-model="sText" @keydown="searchKeyDown" :placeholder="$t('spoon.please-search')">
						<div class="input-group-append">
							<VueLoadingButton
								class="btn base-button btn-primary"
								@click.native="searchUser"
								:loading="loading.search"
								>{{ $t('search') }}</VueLoadingButton>
						</div>
					</base-input>
				</div>
			</div>
			<!-- S:List group -->
			<ul class="list-group list-group-flush list my-0">
				<!-- S:Admins -->
				<li v-for="user in users"
					:key="user.tag"
					class="list-group-item px-0">
					<div class="row align-items-center">
						<div class="col-auto py-4">
							<!-- Avatar -->
							<a href="#!" class="avatar avatar-xl rounded-circle" >
								<img 
									:style="{ backgroundImage: 'url(' + user.profile_url + ')' }"
									class="rounded-circle ma-0"
									style="height: 100%; background-position: center; background-repeat: no-repeat; background-size: cover;">
							</a>
						</div>
						<div class="col ml--2">
							<h4 class="mb-0">
								<a href="#!">{{user.nickname}}</a>
							</h4>
							<p><small class="text-muted mb-2">{{ user.tag }}</small></p>
							<span :class="`text-${!!(user.current_live && user.current_live.id) ? 'success' : 'danger'}`">● </span>
							<small>{{!!(user.current_live && user.current_live.id) ? 'On Air' : 'Off Air'}}</small>
						</div>
						<div class="col-auto">
							<button @click="addAdmin(user); modal.search = false;" type="button" class="btn btn-sm btn-primary">Add</button>
						</div>
					</div>
				</li>
			</ul>
			<!-- P:List group -->

            <template slot="footer">
                <base-button type="link" class="ml-2" @click="modal.search = false">Cancel</base-button>
            </template>
        </modal>
		<!-- E:Search User -->
		<!-- S:Profile Image Modal -->
		<modal :show.sync="modal.picture" class="custom">
			<img :src="profile_url" class="img-center" style="width:100%; border-radius:5px;">
		</modal>
		<!-- E:Profile Image Modal -->
	</div>
</template>
<script>
import { Select, Option } from 'element-ui';
import EventBus from '@/plugins/event-bus.js';
import VueLoadingButton from 'vue-loading-button';

export default {
	components: {
		[Select.name]: Select,
		[Option.name]: Option,
		VueLoadingButton,
	},
	methods: {
		delAdmin(user) {
			const idx = this.admins.findIndex(a => a.tag === user.tag);
			if ( idx >= 0 ) {
				this.$cfg('admins').cfg.splice(idx, 1);
				this.$cfg('admins').__saveConfigFile();
				this.$notify({
					type: 'default',
					message: this.$t('setting.admin.del-complete'),
					horizontalAlign: 'right',
					verticalAlign: 'top',
				});
			}
		},
		addAdmin(user) {
			const idx = this.admins.findIndex(a => a.tag === user.tag);
			if ( idx >= 0 ) {
				this.$notify({
					type: 'danger',
					message: this.$t('setting.admin.is-admin'),
					horizontalAlign: 'right',
					verticalAlign: 'top',
				});
				return;
			}

			this.$cfg('admins').cfg.push(user);
			this.$cfg('admins').__saveConfigFile();
		},
		searchUser() {
			if ( this.loading.search ) {
				return;
			}

			this.loading.search = true;
			this.$s().search(this.sText)
				.then((res) => {
					this.users = res;
				})
				.finally(() => {
					this.loading.search = false;
				});
		},
		searchKeyDown(evt) {
			switch ( evt.keyCode ) {
				case 13: // Enter
					this.searchUser();
					break;
			}
		},
	},
	data() {
		return {
			admins: this.$cfg('admins').cfg,
			users: [],
			sText: "",
			profile_url: "",
			modal: {
				search: false,
				picture: false,
			},
			loading: {
				search: false,
			},
		};
	},
};
</script>
<style scope>
.add-admin-box {
	border: dashed 1px #afafaf !important;
	cursor: pointer;
}
.add-admin-box:hover {
	border: dashed 1px #000 !important;
	background-color: #fafafa;
}
.btn {
	font-size: 0.875rem !important;
	padding: 0.7rem 1rem !important;
}
</style>
