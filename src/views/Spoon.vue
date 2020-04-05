<template>
	<div class="row ma-0" style="height: 100vh; overflow-y: hidden;">
		<div class="col" style="padding: 2.5rem">
			<div class="row ma-0" style="overflow-y: hidden;">
				<div class="col col-6 px-3 my-4">
					<!-- S:HLS Player -->
					<video ref="live-player" style="width: 0px; height: 0px; position: absolute;"></video>
					<!-- E:HLS Player -->
					<div class="row ma-0">
						<div
							v-for="(con, idx) in controls"
							:key="con.title + '-' + idx"
							:class="con.class">
							<card>
								<label class="card-title h5 d-flex align-items-center text-center mb-0">
									<span class="mr-3">{{ con.title }}</span>
									<base-switch
										v-if="con.type === 'toggle'"
										@input="con.callback"
										v-model="con.model"></base-switch>
								</label>
							</card>
							
						</div>
					</div>
				</div>
				<!-- S:Right Panel -->
				<div class="col col-6 px-3 my-4">
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
								style="height: calc(100vh - 5rem - 64px); overflow-y:auto; oveflow-x:hidden;"
								ref="chat-scroll"
								id="chat-scroll"
								class="row ma-0">
								<!-- S:Live Card -->
								<div class="col col-12 pa-0" style="overflow-x: hidden;">
									<!-- S:Not Join Live -->
									<div 
										v-if="live.info === null"
										class="row align-items-center justify-content-center"
										style="height: 100%">
										<div class="col-lg-7 col-md-10">
											<div class="card bg-secondary border-0 mb-0">
												<div class="card-body px-lg-3 py-lg-3 text-center">
													{{ $t('spoon.live.not-join') }}
												</div>
											</div>
										</div>
									</div>
									<!-- E:Not Join Live -->
									<!-- S:Live Chat Box -->
									<div
										v-else
										class="row align-items-end justify-content-center"
										style="height: 100%">
										<div
											class="col col-12"
											v-for="(msg, idx) in live.msgs"
											:key="msg.event+'-'+idx">
											<comment
												v-if="msg.event === 'live_message'"
												:user-image="msg.data.author.profile_url"
												:user-name="msg.data.author.nickname"
												class="text-white"
												:text="msg.data.message"/>
										</div>
									</div>
									<!-- E:Live Chat Box -->
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
import Hls from 'hls.js';
import Comment from '@/components/Feed/Comment';

export default {
	name: 'Spoon',
	components: {
		VueLoadingButton,
		InfiniteLoading,
		Comment,
	},
	methods: {
		tabChange(tab) {
			this.tab = tab;
			/*
			if ( tab === "live-list" ) {
				this.$s().getLive()
				.then(res => {
					this.liveList = res;
				});
			}
			*/
		},
		loadMoreLive($state) {
			if ( !this.$cfg('app').get('spoon.filter') ) {
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
			} else {
				$state.complete();
			}
		},
		selectLive(liveId) {
			const cfg = this.$cfg('app').cfg;
			const user = cfg.user;

			if ( this.live.hls ) {
				this.live.hls.destroy();
			}

			this.$s(user.token).liveInfo(liveId)
				.then(res => {
					// live hls play

					this.tab = 'live-chat';
					/*
					const video = this.$refs['live-player'];
					if ( Hls.isSupported() ) {
						this.live.hls = new Hls();
						this.live.hls.loadSource(res.url_hls);
						this.live.hls.attachMedia(video);
						this.live.hls.on(Hls.Events.MANIFEST_PARSED, () => {
							video.play();
						});
					} else {
						console.error('Hls is not supported');
					}
					*/

					// live join
					this.live.info = this.$s(user.token).$live(liveId, { user_id: user.id });
					this.live.info.connect();
					this.live.info.onmessage = (msg) => {
						if ( msg.event === "live_health" ) return;

						if ( this.live.msgs.length >= 100 ) {
							this.live.msgs.shift();
						}
						this.live.msgs.push(msg);

						setTimeout(() => {
							if ( this.$refs['chat-scroll'] ) {
								const chatScroll = this.$refs['chat-scroll'];
								if ( chatScroll.scrollHeight - 560 <= chatScroll.scrollTop + 300 ) {
									chatScroll.scrollTop = chatScroll.scrollHeight;
								}
							}
						}, 100);
					};
				})
				.catch((err) => {
					console.error(err);
				});
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
					this.liveList = searchLive;
					this.search = false;
					break;
			}
		}
	},
	mounted() {
		const app = this.$cfg('app');

		console.log(app);
		if ( app.get('spoon.filter') ) {
			this.$s(app.get('user.token')).subscribedLive()
				.then(res => {
					this.liveList = res;
				});
		} else {
			this.$s().getLive()
				.then(res => {
					this.liveList = res;
				});
		}
	},
	data() {
		return {
			isLoading: false,
			loadMoreLiveMutex: false,
			liveList: [],
			tab: 'live-list',
			live: {
				msgs: [],
				info: true,
			},
			search: false,
			sText: '',
			controls: [
				{
					"title": this.$t('spoon.controls.filter'),
					"type": "toggle",
					"class": "col col-12 col-xl-6",
					"model": this.$cfg('app').get('spoon.filter'),
					"callback": (state) => {
						const app = this.$cfg('app');
						app.set('spoon.filter', state);

						if ( state ) {
							this.$s(app.get('user.token')).subscribedLive()
								.then(res => {
									this.liveList = res;
								});
						} else {
							this.$s().getLive()
								.then(res => {
									this.liveList = res;
								});
						}
					},
				}
			],
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
</style>