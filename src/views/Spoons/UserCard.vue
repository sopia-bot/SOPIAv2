<template>
    <div>
		<!-- S:Profile Modal -->
		<modal :show.sync="profileShow">
			<h6 slot="header" class="modal-title" id="modal-title-default">{{ $t('profile') }}</h6>

			<!-- S:Profile -->
            <div class="row ma-0 justify-content-center">
				<div class="col col-4">
					<img
						:style="{ backgroundImage: 'url(' + selectedUser.profile_url + ')' }"
						class="rounded-circle ma-0  img-center img-fluid"
						@click="modal.picture = true"
						style="height: 120px; width:120px; background-position:center; background-repeat: no-repeat; background-size: cover;">
				</div>
				<div class="col justify-content-start">
					<h3 class="ma-0">{{ selectedUser.nickname }}</h3>
					<small>{{ selectedUser.tag }}</small>
					<p><strong class="text-primary">{{ selectedUser.follower_count }}</strong> FAN <strong class="text-primary ml-2">{{ selectedUser.following_count }}</strong> Following</p>
					
					<base-button
						v-if="isFollowing(selectedUser) === 'followed'"
						size="sm"
						@click="$s().unfollow(selectedUser.id).then(() => { selectedUser.follow_status = 0 })"
						type="secondary">Unfollow</base-button>
					<base-button
						v-else-if="isFollowing(selectedUser) === 'unfollowed'"
						size="sm"
						@click="$s().follow(selectedUser.id).then(() => { selectedUser.follow_status = 1 })"
						type="warning">Follow</base-button>
				</div>
			</div>
			<!-- E:Profile -->

			<!-- S:Voice Type -->
			<div class="row ma-0 mt-4" v-if="selectedUser.top_impressions && selectedUser.top_impressions.length > 0">
				<div class="col col-12 text-center">
					<span class="mr-3">Voice Type</span>
					<badge
						v-for="imp in selectedUser.top_impressions"
						:key="imp"
						size="md"
						class="mr-2"
						:style="{
							backgroundColor: '#' + impressions[imp].color,
						}">
						{{ impressions[imp].name }}
					</badge>
				</div>
			</div>
			<!-- E:Voice Type -->

			<!-- S:Admin Tools -->
			<div class="row ma-0 mt-4 justify-content-center" v-if="['dj', 'manager'].includes(isAdmin(userData)) && !['dj', 'me'].includes(isAdmin(selectedUser))">
				<!-- S:Block User -->
				<div class="col text-center">
					<p>
						<base-button
							size="lg"
							outline
							style="width: 50px;"
							@click="modal.block = true;"
							type="secondary">
							<i class="fas fa-door-open"></i>
						</base-button>
					</p>
					<p>{{ $t('spoon.profile.kick') }}</p>
				</div>
				<!-- E:Block User -->
				<!-- S:Manager -->
				<div class="col col-6 text-center" v-if="isAdmin(userData) === 'dj'">
					<!-- S:Give Manger -->
					<div v-if="isAdmin(selectedUser) === 'manager'">
						<p>
							<base-button
								size="lg"
								outline
								style="width: 50px;"
								@click="unmanager(selectedUser)"
								type="info">
								<i class="fas fa-ankh"></i>
							</base-button>
						</p>
						<p>{{ $t('manager') }}</p>
					</div>
					<!-- E:Give Manger -->
					<div v-else>
						<p>
							<base-button
								size="lg"
								outline
								style="width: 50px;"
								@click="manager(selectedUser)"
								type="secondary">
								<i class="fas fa-ankh"></i>
							</base-button>
						</p>
						<p>{{ $t('spoon.profile.manager') }}</p>
					</div>
				</div>
				<!-- E:Manager -->
			</div>
			<!-- E:Admin Tools -->
		</modal>
		<!-- E:Profile Modal -->
		<!-- S:Profile Image Modal -->
		<modal :show.sync="modal.picture" class="custom">
			<img :src="selectedUser.profile_url" class="img-center" style="width:100%; border-radius:5px;">
		</modal>
		<!-- E:Profile Image Modal -->
		<!-- S:Confirm -->
		<modal :show.sync="modal.block">
            <h6 slot="header" class="modal-title" id="modal-title-default">{{ $t('spoon.profile.kick') }}</h6>

            <p>{{ $t('spoon.block') }}</p>

            <template slot="footer">
                <base-button type="warning" class="ml-auto" @click="blockUser(selectedUser); modal.block = false; profileShow = false;">OK</base-button>
                <base-button type="link" class="ml-2" @click="modal.block = false">Cancel</base-button>
            </template>
        </modal>
		<!-- E:Confirm -->
    </div>
</template>
<script>
export default {
    name: 'SpoonUserCard',
    methods: {
		isAdmin(author) {
            const liveClass = this.$s().$live();
            let ret = false;
			if ( liveClass && liveClass.info ) {
                const live = liveClass.info;

				if ( live.author.id === author.id ) {
					ret = 'dj';
				}
				if ( this.userData.id === author.id ) {
					ret = 'me';
				}
				if ( live.manager_ids.includes(author.id) ) {
					ret = 'manager';
				}
            }
			return ret;
		},
		isFollowing(author) {
			const me = this.userData;
			if ( me ) {
				if ( me.id !== author.id ) {
					switch ( author.follow_status ) {
						case 1: return "followed";
						case 0:
						case 2: return "unfollowed";
					}
				} else {
					return "me";
				}
			}
		},
		manager(author) {
            const liveClass = this.$s().$live();
			if ( liveClass && liveClass.info ) {
                const live = liveClass.info;
				if ( live.manager_ids.length < 3 ) {
					live.manager_ids.push(author.id);
					this.$s().managerApply(live.id, live.manager_ids)
						.then(res => {
							this.live.data = res;
						});
				}
			}
		},
		unmanager(author) {
			const liveClass = this.$s().$live();
			if ( liveClass && liveClass.info ) {
                const live = liveClass.info;
				const idx = live.manager_ids.indexOf(author.id);
				if ( idx >= 0 ) {
					live.manager_ids.splice(idx, 1);
					this.$s().managerApply(live.id, live.manager_ids)
						.then(res => {
							this.live.data = res;
					});
				}
			}
		},
		blockUser(author) {
			const liveClass = this.$s().$live();
			if ( liveClass && liveClass.info ) {
                const live = liveClass.info;
				this.$s().blockUser(live.id, author.id)
					.then(res => {
				    });
			}
		},
    },
    mounted() {
        this.$evt.$on('user-card-show', (data) => {
            this.profileShow = true;
            this.selectedUser = data.selectedUser;
            this.userData = data.userData;
        });
    },
    data() {
        return {
            profileShow: false,
            modal: {
                picture: false,
                block: false,
            },
            userData: {},
            selectedUser: {},
			impressions: [
				"",
				{ name: 'sweet', color: 'ffabad' },
				{ name: 'sexy', color: 'ff6050' },
				{ name: 'gentle', color: '007dcc' },
				{ name: 'cool', color: '007dcc' },
				{ name: 'warm', color: '5fd8a5' },
				{ name: 'soft', color: '5fd8a5' },
				{ name: 'friendly', color: '007dcc' },
				{ name: 'powerful', color: '88ca00' },
				{ name: 'funny', color: '88ca00' },
				{ name: 'tough', color: '69390b' },
				{ name: 'cute', color: 'ff6050' },
				{ name: 'husky', color: '69390b' },
				{ name: 'romantic', color: 'ffabad' },
				{ name: 'scary', color: '69390b' },
			],
        };
    },
}
</script>