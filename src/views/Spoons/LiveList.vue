<template>
    <div
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
</template>
<script>
import InfiniteLoading from 'vue-infinite-loading';
import Hls from 'hls.js';

export default {
    name: 'SpoonLiveList',
    components: {
		InfiniteLoading,
    },
    methods: {
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
        filterEvents(msg) {
            if ( msg.event === "live_health" ||
                msg.event === "live_leave" ||
                msg.event === "live_update" ||
                msg.event === "live_state" ||
                msg.event === "live_shadowjoin" ||
                msg.useragent === "Server" ) return true;
            return false;
        },
		selectLive(liveId) {
			const cfg = this.$cfg('app').cfg;
            const user = cfg.user;
            
			sessionStorage['before-live'] = liveId;

			this.$s(user.token).liveInfo(liveId)
				.then(res => {

                    this.$evt.$emit('live-tab-change', 'live-chat');

					if ( !res.is_like ) {
                        setTimeout(() => {
                            this.$evt.$emit('leftitems-controls', {
                                type: 'unshift',
                                data: {
                                    "title": "",
                                    "type": "icon-btn",
                                    "class": "col col-12 col-md-3",
                                    "cardClass": "bg-transparent pa-0",
                                    "model": false,
                                    "icon": "ni ni-favourite-28",
                                    "itemClass": "btn-danger",
                                    "key": "like-live",
                                    "v-if": (tab) => {
                                        return tab === 'live-chat';
                                    },
                                    "callback": (state) => {
                                        this.$s(user.token).likeLive(liveId)
                                            .then(res => {
                                                this.$evt.$emit('leftitems-controls', {
                                                    type: 'delete',
                                                    key: 'like-live',
                                                });
                                            });
                                    }
                                }
                            });
                        }, 1000);
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
					
					{
						const tmp = this.$s(user.token).$live();
						if ( tmp ) {
							tmp.disconnect();
						}
					}

					// live join

                    this.live = this.$s(user.token).$live(liveId, { user_id: user.id, country: "kr" });
                    this.live.info = res;
					this.live.connect();
					this.live.onmessage = (msg) => {
						// if live closed
						if ( msg.event === "live_update" ) {
							if ( msg.data && msg.data.live && msg.data.live.close_status === 1 ) {
								// live closed
								this.live.info.disconnect();
								this.live.info = null;
								this.live.msgs = [];
								this.chat = "";
								console.log("============ close ============");
								return;
							}
						}
                        
                        this.$evt.$emit('onmessage', msg);

						// sopia bot emit
						if ( msg.event === "live_message" ) {
							this.$s().$emit(liveId, msg.event, msg);
						}
						
						// for spoor chat
						if ( msg.event === "live_present" ) {
							const spoor = this.$cfg('app').get('spoor');
							const data = msg.data;
							this.$logger.debug('spoorchat', "spoor enable", spoor.enable, "data", data, "spoor minspoon", spoor.minspoon );
							if ( spoor.enable && (data.combo * data.amount) >= spoor.minspoon )  {
								this.$s().$sopia.pushUser(data.author);
							}
						} else if ( msg.event === "live_message" ) {
							// spoorchat
							if ( this.$s().$sopia.tts.user.length > 0 ) {
								this.$s().$sopia.pushTtsList(msg.data);
							}
						}

						if ( msg.event === "live_failover" ) {
							// 연결이 끊길 때가 있다
							this.selectLive(liveId);
							return;
						}

                        if ( this.filterEvents(msg) ) {
                            return;
                        }

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
                    };
                    
                    
                    {
                        const live = this.$s(user.token).$live();
                        if ( live && live.live_id === liveId ) {
                            return;
                        }
                    }

                    // 인사말 추가.
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
    },
    mounted() {
        const app = this.$cfg('app');
        
		if ( sessionStorage['before-live'] && sessionStorage['before-live'] !== "undefined" ) {
            const live = sessionStorage['before-live'];
            console.log(live, 'before-live')
			sessionStorage['before-live'] = undefined;
			this.selectLive(live);
			return;
		}

		this.userData = app.get('user');
		if ( app.get('spoon.filter') ) {
			this.$s(app.get('user.token')).subscribedLive()
				.then(res => {
					this.liveList = res;
					return this.$s().mini_profile(this.userData.id);
				})
				.then(mini_profile => {
					if ( mini_profile.current_live && mini_profile.current_live.id ) {
						this.$s().liveInfo(mini_profile.current_live.id)
							.then(liveInfo => {
								this.liveList.unshift(liveInfo);
							});
					}
				});
		} else {
			this.$s(app.get('user.token'));
		}

		this.$evt.$on('live-list', (data) => {
			switch ( data.type ) {
				case "overwrite":
					this.liveList = data.data;
					break;
			}
		});
    },
    data() {
        return {
            liveList: [],
			live: {},
        };
    },
}
</script>