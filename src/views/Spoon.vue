<template>
	<div class="row ma-0" style="height: 100vh; overflow-y: hidden;">
		<div class="col" style="padding: 2.5rem">
			<div class="row ma-0" style="overflow-y: hidden;">
				<div class="col col-6 px-3 py-4">
					<!-- S:HLS Player -->
					<video ref="live-player" style="width: 0px; height: 0px; position: absolute;"></video>
					<!-- E:HLS Player -->
					<div class="row ma-0 align-items-center">
						<div
							v-for="(con, idx) in controls"
							:key="con.title + '-' + idx"
							v-if="con['v-if'] ? con['v-if']() : true"
							class="mb-3"
							:class="con.class">
							<div class="card-body bg-white rounded-lg text-center mb-0" :class="con.cardClass || ''">
								<label class="card-title h5 d-flex align-items-center justify-content-center mb-0">
									<span class="mr-3" v-if="con.title.length > 0">{{ con.title }}</span>
									<base-switch
										v-if="con.type === 'toggle'"
										@input="con.callback"
										:class="con.itemClass || ''"
										v-model="con.model"></base-switch>
									<button
										v-else-if="con.type === 'icon-btn'"
										class="btn base-button btn-primary px-3"
										:class="con.itemClass || ''"
										@click="con.callback">
										<i :class="con.icon"></i>
									</button>
									<div
										v-else-if="con.type === 'stats'"
										class="row ma-0">
										<div class="col">
											<h5 class="card-title text-uppercase text-muted mb-0">{{ con['sub-title'] }}</h5>
											<span class="h2 font-weight-bold mb-0">{{ con.content() }}</span>
										</div>
										<div class="col-auto">
											<div class="icon icon-shape rounded-circle shadow" :class="con.itemClass || ''">
												<i :class="con.icon"></i>
											</div>
										</div>
									</div>
								</label>
							</div>
							
						</div>
					</div>
				</div>
				<!-- S:Right Panel -->
				<div
					class="col col-6 px-3 py-4"
					:style="{
						background: live.data && live.data.is_freeze ? 'linear-gradient( to top, lightblue, rgba(0, 0, 0, 0) )' : '',
					}">
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
										<div slot="no-more" class="text-white">{{ $t('spoon.load-fin') }}</div>
										<div slot="no-results" class="text-white">{{ $t('spoon.load-fin') }}</div>
									</infinite-loading>
								</div>
							</div>
							<!-- E:Live List -->
							<!-- S:Live Chat -->
							<div
								v-if="tab === 'live-chat'"
								style="height: calc(100vh - 5rem - 160px); overflow-y:auto; oveflow-x:hidden;"
								ref="chat-scroll"
								id="chat-scroll"
								class="row ma-0 mb-3">
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
											class="col col-12 px-3 mt-4"
											v-for="(msg, idx) in live.msgs"
											:key="msg.event+'-'+idx">
											<!-- S:Live Message -->
											<comment
												v-if="msg.event === 'live_message'"
												:user-image="msg.data.author.profile_url"
												:user-name="msg.data.author.nickname"
												:type="getUserType(msg.data.author)"
												class="text-white"
												:text="msg.data.message"/>
											<!-- E:Live Message -->
											<!-- S:Live Like -->
											<div
												v-else-if="msg.event === 'live_like'" 
												class="alert alert-like mb-0">
												{{ msg.data.author.nickname }}{{ $t('spoon.live.like') }}
											</div>
											<!-- E:Live Like -->
											<!-- S:Live Join -->
											<div
												v-else-if="msg.event === 'live_join'"
												class="alert alert-join mb-0">
												{{ msg.data.author.nickname }}{{ $t('spoon.live.join') }}
											</div>
											<!-- E:Live Join -->
											<!-- S:User Block -->
											<div
												v-else-if="msg.event === 'live_block'"
												class="alert alert-block mb-0">
												{{ msg.data.author.nickname }}{{ $t('spoon.live.block') }}
											</div>
											<!-- E:User Block -->
											<!-- S:Live Present -->
											<div
												v-else-if="msg.event === 'live_present'"
												class="mb-0">
												<p>
													<img
														class="rounded-circle img-center img-fluid"
														:src="$s().getImg(msg.data.sticker)">
												</p>
												<div class="text-center">
													<h5 class="h1 title text-white">{{ msg.data.author.nickname }}</h5>
													<small class="h2 font-weight-light text-white">
														{{ msg.data.amount }}{{ $t('spoon.live.spoon') }} X 
														<span class="font-weight-bold text-spoon">{{ msg.data.combo }}</span>
													</small>
												</div>
											</div>
											<!-- E:Live Present -->
										</div>
									</div>
									<!-- E:Live Chat Box -->
								</div>
								<!-- E:Live Card -->
							</div>
							<!-- E:Live Chat -->
							<div v-if="tab === 'live-chat'" class="row ma-0">
								<div class="col col-10">
									<input
										ref="search"
										type="text"
										class="form-control"
										style="height: 43px;"
										@keydown="chatKeyDown"
										:disabled="live.data && live.data.is_freeze"
										:placeholder="$t('spoon.live.input-chat')"
										v-model="live.chat" />
								</div>
								<div class="col col-2 px-0">
									<button
										style="width:100%;"
										@click="sendChat"
										:disabled="live.data && live.data.is_freeze"
										class="btn base-button btn-warning text-center px-2">
										{{ $t('spoon.live.send') }}
									</button>
								</div>
							</div>
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

					if ( !res.is_like ) {
						this.controls.unshift({
							"title": "",
							"type": "icon-btn",
							"class": "col col-12 col-md-3",
							"cardClass": "bg-transparent pa-0",
							"model": false,
							"icon": "ni ni-favourite-28",
							"itemClass": "btn-danger",
							"key": "like-live",
							"callback": (state) => {
								this.$s(user.token).likeLive(liveId)
									.then(res => {
										const idx = this.controls.findIndex((control => {
											return control.key = "like-live";
										}));
										if ( idx >= 0 ) {
											this.controls.splice(idx, 1);
										}
									});
							}
						});
					}

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
						// sopia bot emit
						this.$s().$emit(liveId, msg.event, msg);

						if ( msg.event === "live_failover" ) {
							// 연결이 끊길 때가 있다
							this.selectLive(liveId);
							return;
						}


						if ( msg && msg.data && msg.data.live && msg.data.live.manager_ids ) {
							this.live.data = msg.data.live;
						}

						if ( msg.event === "live_health" ||
							 msg.event === "live_leave" ||
							 msg.event === "live_update" ||
							 msg.event === "live_state" ||
							 msg.event === "live_shadowjoin" ||
							 msg.useragent === "Server" ) return;


						if ( this.live.msgs.length >= 100 ) {
							this.live.msgs.shift();
						}
						
						// 메시지 개행
						if ( msg.event === "live_message" ) {
							msg.data.message = msg.data.message
													.replace(/\</g, "&lt;")
													.replace(/\>/g, "&gt;")
													.replace(/\n/g, "<br>");
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
					this.live.msgs.push({
						event: "live_message",
						data: {
							author: res.author,
							live: res,
							message: res.welcome_message.replace(/\</g, "&lt;")
													.replace(/\>/g, "&gt;")
													.replace(/\n/g, "<br>"),
						},
					});
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
		},
		chatKeyDown(evt) {
			switch (evt.keyCode) {
				case 13: // Enter
					this.sendChat();
					break;
			}
		},
		sendChat() {
			const chat = this.live.chat
									.replace(/\\/g, "\\\\");
			if ( chat.trim().length > 0 ) {
				this.live.info.message(chat);
				this.live.chat = "";
			}
		},
		getUserType(author) {
			if ( this.live.data ) {
				if ( this.live.data.author.id === author.id ) {
					return "dj";
				} else if ( this.live.data.manager_ids.includes(author.id) ) {
					return "manager";
				}
			}
		},
	},
	mounted() {
		const app = this.$cfg('app');

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
				chat: "",
				data: null,
			},
			search: false,
			sText: '',
			controls: [
				{
					"title": this.$t('spoon.controls.filter'),
					"type": "toggle",
					"class": "col col-12 col-md-6",
					"model": this.$cfg('app').get('spoon.filter'),
					"v-if": () => this.tab === 'live-list',
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
				},
				{
					"title": "",
					"sub-title": this.$t('spoon.controls.listener'),
					"type": "stats",
					"class": "col col-12 col-md-6",
					"content": () => this.live.data ? this.live.data.member_count : 0,
					"v-if": () => this.tab === 'live-chat',
					"icon": "ni ni-headphones",
					"itemClass": "bg-default text-white",
				},
				{
					"title": "",
					"sub-title": this.$t('spoon.controls.like'),
					"type": "stats",
					"class": "col col-12 col-md-6",
					"content": () => this.live.data ? this.live.data.like_count : 0,
					"v-if": () => this.tab === 'live-chat',
					"icon": "ni ni-favourite-28",
					"itemClass": "bg-red text-white",
				},
				{
					"title": "",
					"sub-title": this.$t('spoon.controls.sum'),
					"type": "stats",
					"class": "col col-12 col-md-6",
					"content": () => this.live.data ? this.live.data.total_member_count : 0,
					"v-if": () => this.tab === 'live-chat',
					"icon": "ni ni-circle-08",
					"itemClass": "bg-spoon text-white",
				},
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
</style>