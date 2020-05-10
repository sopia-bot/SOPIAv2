<template>
    <div>
        <div
            style="height: calc(100vh - 5rem - 160px); overflow-y:auto; oveflow-x:hidden;"
            ref="chat-scroll"
            id="chat-scroll"
            class="row ma-0 mb-3">
            <!-- S:Live Card -->
            <div class="col col-12 pa-0" style="overflow-x: hidden;">
                <!-- S:Not Join Live -->
                <div 
                    v-if="!$s().$live() && !$s().$live().info"
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
                        v-for="(msg, idx) in $s().$live().msgs"
                        :key="msg.event+'-'+idx">
                        <!-- S:Live Message -->
                        <comment
                            v-if="msg.event === 'live_message'"
                            :user-image="msg.data.author.profile_url"
                            :user-name="msg.data.author.nickname"
                            :type="getUserType(msg.data.author)"
                            :user="msg.data.author"
                            @click="commentClick"
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
        <div class="row ma-0">
            <div class="col col-10">
                <input
                    ref="search"
                    type="text"
                    class="form-control"
                    style="height: 43px;"
                    @keydown="chatKeyDown"
                    :disabled="$s().$live().info && $s().$live().info.is_freeze"
                    :placeholder="$t('spoon.live.input-chat')"
                    v-model="chat" />
            </div>
            <div class="col col-2 px-0">
                <button
                    style="width:100%;"
                    @click="sendChat"
                    :disabled="$s().$live().info && $s().$live().info.is_freeze"
                    class="btn base-button btn-warning text-center px-2">
                    {{ $t('spoon.live.send') }}
                </button>
            </div>
        </div>
        <user-card />
    </div>
</template>
<script>
import Comment from '@/components/Feed/Comment';
import UserCard from './UserCard';

export default {
    name: 'SpoonLiveChat',
    components: {  
        Comment,
        UserCard,
    },
    methods: {  
		chatKeyDown(evt) {
			switch (evt.keyCode) {
				case 13: // Enter
					this.sendChat();
					break;
			}
		},
		sendChat() {
			const chat = this.chat.replace(/\\/g, "\\\\");
			if ( chat.trim().length > 0 ) {
				this.$s().$live().message(chat);
                this.chat = "";

                setTimeout(() => {
                    if ( this.$refs['chat-scroll'] ) {
                        const chatScroll = this.$refs['chat-scroll'];
                        chatScroll.scrollTop = chatScroll.scrollHeight;
                    }
                }, 100);
			}
		},
		commentClick(evt, user) {
			this.selectedUser = user;
			this.$s().mini_profile(user.id)
				.then(res => {
			        this.$evt.$emit('user-card-show', {
                        selectedUser: res,
                        userData: this.userData,
                    });
				});
        },
		getUserType(author) {
            const live = this.$s().$live().info;
			if ( live ) {
				if ( live.author.id === author.id ) {
					return "dj";
				} else if ( live.manager_ids.includes(author.id) ) {
					return "manager";
				}
			}
		},
    },
    mounted() {
		const app = this.$cfg('app');
        this.userData = app.get('user');
        
        this.$evt.$on('onmessage', (msg) => {
            setTimeout(() => {
                if ( this.$refs['chat-scroll'] ) {
                    const chatScroll = this.$refs['chat-scroll'];
                    if ( chatScroll.scrollHeight - 560 <= chatScroll.scrollTop + 300 ) {
                        chatScroll.scrollTop = chatScroll.scrollHeight;
                    }
                }
            }, 100);
        });
        this.$evt.$on('live-tab-change', (tab) => {
			if ( tab === "live-chat" ) {
                setTimeout(() => {
                    const chatScroll = document.querySelector('#chat-scroll');
                    if ( chatScroll ) {
                        chatScroll.scrollTop = chatScroll.scrollHeight;
                    }
                }, 100);
            }
		});
    },
    data() {
        return {
            selectedUser: {},
            userData: {},
            chat: "",
        };
    },
}
</script>