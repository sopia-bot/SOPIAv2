<template>
	<div class="row ma-0" style="height: 100vh; overflow-y: hidden;">
		<div class="col" style="padding: 2.5rem">
			<div class="row ma-0" style="overflow-y: hidden;">
				<div class="col col-6 px-3 py-4">
					<LeftItem />
				</div>
				<!-- S:Right Panel -->
				<div
					class="col col-6 px-3 py-4">
					<!-- S:Control Button -->
					<div class="row ma-0">
						<div v-if="!search" class="col col-10 px-3">
							<base-button
								@click="tabChange('live-list')"
								:type="tab === 'live-list' ? 'primary' : 'secondary'"
								class="mr-3">{{ $t('spoon.live.list') }}</base-button>
							<base-button
								@click="tabChange('live-chat')"
								:type="tab === 'live-chat' ? 'primary' : 'secondary'"
								class="mr-3">{{ $t('spoon.live.chat') }}</base-button>
						</div>
						<div v-else class="col col-10 px-3">
							<input
								ref="search"
								type="text"
								class="form-control"
								style="height: 43px;"
								@keydown="searchKeyDown"
								:placeholder="$t('spoon.please-search')"
								v-model="sText" />
						</div>
						<div class="col-2 text-right pa-0 pr-2">
							<button
								v-if="!search"
								@click="showSearch"
								class="px-3 bg-secondary text-default btn base-button">
								<i class="fas fa-search"></i>
							</button>
							<base-button
								v-else
								@click="search = false"
								class="px-3 bg-secondary text-default btn base-button">
								<i class="fas fa-times"></i>
							</base-button>
						</div>
					</div>
					<!-- E:Control Button -->
					<div class="row ma-0 mt-4">
						<div class="col col-12 pr-0">
							<LiveList v-if="tab === 'live-list'"/>
							<LiveChat v-else-if="tab === 'live-chat'"/>
						</div>
					</div>
				</div>
				<!-- E:Right Panel -->
			</div>
		</div>
	</div>
</template>
<script>
import VueLoadingButton from 'vue-loading-button';
import electron from 'electron';
const { ipcRenderer } = electron;

import LeftItem from './Spoons/LeftItems';
import LiveChat from './Spoons/LiveChat';
import LiveList from './Spoons/LiveList';

export default {
	name: 'Spoon',
	components: {
		VueLoadingButton,
		LeftItem,
		LiveChat,
		LiveList,
	},
	methods: {
		tabChange(tab) {
			this.$evt.$emit('live-tab-change', tab);
		},
		showSearch() {
			this.sText = "";
			this.search = true;
			setTimeout(() => {
				this.$refs.search.focus();
			}, 100);
		},
		searchKeyDown(evt) {
			switch ( evt.keyCode ) {
				case 13: // Enter
					const searchLive = [];
					this.$s().search(this.sText)
						.then(async (res) => {
							for ( let i=0;i<res.length;i++ ) {
								const user = res[i];
								if ( user.is_live ) {
									const live = await this.$s().liveInfo(user.current_live.id)
									searchLive.push(live);
								}
							};
						});
					this.$evt.$emit('live-list', {
						type: 'overwrite',
						data: searchLive
					});
					this.search = false;
					break;
			}
		},
	},
	mounted() {
		const app = this.$cfg('app');
		this.userData = app.get('user');

		this.$evt.$on('live-tab-change', (tab) => {
			this.tab = tab;
		});
	},
	data() {
		return {
			isLoading: false,
			loadMoreLiveMutex: false,
			tab: 'live-list',
			userData: {},
			search: false,
			sText: '',
		};
	},
}
</script>
<style scope>
.btn.base-button {
	-webkit-transform: unset;
    transform: unset;
}
.btn.base-button.btn-secondary:hover {
	color: #5e72e4;
}
.media-comment-text {
	background: rgba(50, 50, 50, 0.7);
}
.media-comment-text h6 {
	color: white;
}
.form-group,
p {
	margin-bottom: 0;
}
.bg-transparent {
	background-color: transparent !important;
}
.alert-like {
	color: #FCBA3D;
    border-color: rgba(0, 0, 0, 0.5);
    background-color: rgba(0, 0, 0, 0.5);
}
.alert-join {
	color: #fff;
    border-color: rgba(21, 30, 46, 0.5) ;
    background-color: rgba(21, 30, 46, 0.5);
}
.alert-block {
	color: #fff;
	border-color: rgba(201, 52, 82, 0.5);
    background-color: rgba(201, 52, 82, 0.5);
}
.custom .progress {
	margin-bottom: 0;
}
.custom .modal-body {
	padding: 0;
}
</style>
