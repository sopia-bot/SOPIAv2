<template>
	<div class="row ma-0" style="height: 100vh; overflow-y: hidden;">
		<div class="col" style="padding: 2.5rem">
			<div class="row ma-0" style="overflow-y: hidden;">
				<div class="col col-6 px-3" style="background: white;">
					<video ref="live-player"></video>
				</div>
				<!-- S:Right Panel -->
				<div class="col col-6 px-3">
					<!-- S:Control Button -->
					<div class="row ma-0">
						<div class="col col-12 px-3">
							<base-button
								@click="tabChange('live-list')"
								:type="tab === 'live-list' ? 'primary' : 'secondary'"
								class="mr-3">{{ $t('spoon.live.list') }}</base-button>
							<base-button
								@click="tabChange('live-chat')"
								:type="tab === 'live-chat' ? 'primary' : 'secondary'"
								class="mr-3">{{ $t('spoon.live.chat') }}</base-button>
						</div>
					</div>
					<!-- E:Control Button -->
					<div class="row ma-0 mt-4">
						<div class="col col-12">
							<!-- S:Live List -->
							<div
								v-if="tab === 'live-list'"
								style="height: calc(100vh - 5rem - 64px); overflow-y:auto;"
								class="row ma-0">
								<!-- S:Live Card -->
								<div class="col col-12 pa-0" v-for="(live, idx) in liveList" :key="live.author.tag + live.id + idx">
									<card>
										<div class="row align-items-center">
											<div class="col-auto">
												<a href="#" class="avatar avatar-xl rounded-circle" @click="selectLive(live.id)">
													<img 
														:style="{ backgroundImage: 'url(' + live.img_url + ')' }"
														class="rounded-circle ma-0"
														style="height: 100%; background-position: center; background-repeat: no-repeat; background-size: cover;">
												</a>
											</div>
											<div class="col ml--2">
												<h4 class="mb-0">
													<a href="#" @click="selectLive(live.id)">{{ live.title }}</a>
													<p class="text-sm text-muted mb-0">{{ live.author.nickname }}</p>
												</h4>
												<small class="mr-2">
													<i class="ni ni-headphones" style="font-size: x-small"></i>
													{{ live.member_count }}
												</small>
												<small class="mr-2">
													<i class="ni ni-favourite-28" style="font-size: x-small"></i>
													{{ live.like_count }}
												</small>
												<small>
													<i class="ni ni-circle-08" style="font-size: x-small"></i>
													{{ live.total_member_count }}
												</small>
											</div>
											<div class="col-auto"></div>
										</div>
									</card>
								</div>
								<!-- E:Live Card -->
								<div class="col col-12 align-content-center align-items-center">
									<infinite-loading @infinite="loadMoreLive">
										<div slot="no-more text-white">{{ $t('spoon.load-fin') }}</div>
									</infinite-loading>
								</div>
							</div>
							<!-- E:Live List -->
							<!-- S:Live Chat -->
							<div
								v-if="tab === 'live-chat'"
								style="height: calc(100vh - 5rem - 64px); overflow-y:auto;"
								class="row ma-0">
								<!-- S:Live Card -->
								<div class="col col-12 pa-0">
									<!-- S:Not Join Live -->
									<div class="row align-items-center justify-content-center" style="height: 100%">
										<div class="col-lg-7 col-md-10">
											<div class="card bg-secondary border-0 mb-0">
												<div class="card-body px-lg-3 py-lg-3 text-center">
													{{ $t('spoon.live.not-join') }}
												</div>
											</div>
										</div>
									</div>
									<!-- E:Not Join Live -->
								</div>
								<!-- E:Live Card -->
							</div>
							<!-- E:Live Chat -->
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
import InfiniteLoading from 'vue-infinite-loading';

export default {
	name: 'Spoon',
	components: {
		VueLoadingButton,
		InfiniteLoading,
	},
	methods: {
		tabChange(tab) {
			this.tab = tab;
		},
		loadMoreLive($state) {
			this.loadMoreLiveMutex = true;
			this.$s().getLiveNext()
				.then(() => {
					$state.loaded();
				})
				.catch((err) => {
					$state.complete();
				})
				.finally(() => {
					this.loadMoreLiveMutex = false;
					this.liveList = this.$s().liveList;
				});
		},
		selectLive(liveId) {
			const cfg = this.$cfg('app').cfg;
			const user = cfg.user;
			this.$s(user.token).liveInfo(liveId)
				.then(res => {
					console.log(res);
				})
				.catch((err) => {
					console.log(err);
				});
			console.log(liveId);
		},
	},
	mounted() {
		this.$s().getLiveNext()
			.then(res => {
				this.liveList = res;
			})
		console.log(this.$cfg('app'));
	},
	data() {
		return {
			isLoading: false,
			loadMoreLiveMutex: false,
			liveList: [],
			tab: 'live-list',
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
</style>