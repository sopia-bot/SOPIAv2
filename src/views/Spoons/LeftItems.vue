<template>
    <div>
        <!-- S:HLS Player -->
        <video ref="live-player" style="width: 0px; height: 0px; position: absolute;"></video>
        <!-- E:HLS Player -->
        <div class="row ma-0 align-items-center" style="max-height: calc(100vh - 7.5rem); overflow-y: auto;">
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
            <!-- S:Live Info -->
            <div
                v-if="tab === 'live-chat'"
                class="col col-12 mb-0">
                <card class="mb-0">
                    <div class="card-header bg-transparent py-1">
                        <h3>{{ $t('spoon.live.info.name') }}</h3>
                    </div>
                    <div class="card-body bg-white rounded-lg mb-0">
                        <div class="row ma-0 mb-3 justify-content-center">
                            <div class="col text-left">
                                <p class="ma-0">{{ $t('spoon.live.info.title') }}</p>
                            </div>
                            <div class="col col-12 col-md-9 text-right">
                                <p class="ma-0">{{ live.data && live.data.title }}</p>
                            </div>
                        </div>
                        <div class="row ma-0 mb-3 justify-content-center">
                            <div class="col text-left">
                                <p class="ma-0">{{ $t('spoon.live.info.dj') }}</p>
                            </div>
                            <div class="col col-12 col-md-6 text-right">
                                <p class="ma-0">{{ live.data && live.data.author.nickname }}</p>
                            </div>
                        </div>
                        <div class="row ma-0 mb-3 justify-content-center">
                            <div class="col text-left">
                                <p class="ma-0">{{ $t('spoon.live.info.dj-tag') }}</p>
                            </div>
                            <div class="col col-12 col-md-6 text-right">
                                <p class="ma-0">{{ live.data && live.data.author.tag }}</p>
                            </div>
                        </div>
                        <div class="row ma-0 justify-content-center">
                            <div class="col text-left">
                                <p class="ma-0">{{ $t('spoon.live.info.url') }}</p>
                            </div>
                            <div class="col col-12 col-md-9 text-right">
                                <a :href="live.info && live.info.liveUrl" target="_blank" class="ma-0">
                                    {{ live.info && live.info.liveUrl }}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer pb-1">
                        <base-progress
                            animated
                            type="info"
                            class="ma-0 custom"
                            :height="5"
                            :value="getProgressLive()">
                        </base-progress>
                    </div>
                </card>
            </div>
            <!-- E:Live Info -->
        </div>
    </div>
</template>
<script>
import electron from 'electron';
const { ipcRenderer } = electron;

export default {
    name: 'SpoonLeftItem',
    methods: {
        getProgressLive() {
			if ( this.live.data ) {
				const created = new Date(this.live.data.created).getTime();
				const now = new Date().getTime();
				const max = 7200;
				return Math.round(((now-created)/1000) / max * 100);
			} else {
				return 0;
			}
		},
    },
    mounted() {
        this.$store.watch(() => this.$store.getters.spoonTab, (val) => {
            this.tab = this.$store.getters.spoonTab;
        });
        this.tab = this.$store.getters.spoonTab;
    },
    data() {
        return {
            live: this.$s().$live(),
            tab: 'live-list',
            controls: [
				{
					// window popup button
					"title": "",
					"type": "icon-btn",
					"class": "col col-12 col-md-3",
					"cardClass": "bg-transparent pa-0",
					"model": false,
					"icon": "ni ni-ungroup",
					"itemClass": "btn-default",
					"key": "ungroup-window",
					"v-if": () => !this.popupSpoon && !this.popupWindow,
					"callback": () => {
                        this.$store.commit('popupSpoon', true);
                        const live = this.$s().$live();
						if ( live && live.data ) {
							sessionStorage['before-live'] = live.data.id;
						}
						this.$assign("/dashboard/");
						ipcRenderer.send('spoon-popup', (live && live.data) || null);
					}
				},
				{
					// use filter live list
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
					// listener count live info
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
					// like count live info
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
					// total listener live info
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