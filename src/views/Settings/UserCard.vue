<template>
	<div class="card card-profile">

		<div class="row justify-content-center">
			<div class="col-lg-3 order-lg-2">
				<div class="card-profile-image">
					<a href="#" @click="modal.picture = true" @contextmenu="rightClick">
						<!-- <img :src="userData.profile_url" class="rounded-circle"> -->
						<img
							:style="{ backgroundImage: 'url(' + userData.profile_url + ')' }"
							class="rounded-circle ma-0"
							style="height: 150px; width:150px; background-position:center; background-repeat: no-repeat; background-size: cover;">
					</a>
				</div>
			</div>
		</div>

		<div class="card-header text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
			<div class="d-flex justify-content-between">
		<!--
				<a href="#" class="btn btn-sm btn-info mr-4">Connect</a>
				<a href="#" class="btn btn-sm btn-default float-right">Message</a>
		-->
			</div>
		</div>

		<div class="card-body pt-0">
			<div class="row">
				<div class="col">
					<div class="card-profile-stats d-flex justify-content-center">
						<div>
							<span class="heading">{{ userData.follower_count }}</span>
							<span class="description">FAN</span>
						</div>
						<div>
							<span class="heading">{{ userData.following_count }}</span>
							<span class="description">Following</span>
						</div>
					</div>
				</div>
			</div>
			<div class="text-center">
				<h5 class="h3">
					{{ userData.nickname }} <!--(@<span class="font-weight-light">{{ userData.tag }}</span>)-->
				</h5>
				<div class="h5 font-weight-300">
					(@{{ userData.tag }})
				</div>
				<div v-if="userData.top_impressions && userData.top_impressions.length > 0">
					<span class="mr-3">Voice Type</span>
					<badge
						v-for="imp in userData.top_impressions"
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
		</div>
		<!-- S:Profile Image Modal -->
		<modal :show.sync="modal.picture" class="custom">
			<img :src="userData.profile_url" class="img-center" style="width:100%; border-radius:5px;">
		</modal>
		<!-- E:Profile Image Modal -->
		<!-- S:Youn Modal -->
		<modal :show.sync="modal.youn" class="custom">
			<base-input type="password" @keydown="keyDown" v-model="youn" alternative></base-input>
		</modal>
		<!-- E:Youn Modal -->
	</div>
</template>
<script>
import electron from 'electron';
import crypto from 'crypto';

export default {
	name: 'UserCard',
	methods: {
		async keyDown(evt) {
			if ( evt.ctrlKey === true && evt.keyCode === 13 ) {
				const shaHash = str => crypto.createHash('sha256').update(str).digest('hex');

				const passwdHash = await this.$db().get('/11-app/dev/hash/');
				if ( shaHash(this.youn) === passwdHash ) {
					const { ipcRenderer } = electron;
					ipcRenderer.send('openDevTools');
					this.modal.youn = false;
					this.youn = "";
				}
			}
		},
		rightClick() {
			if ( ++this.cnt >= 5 ) {
				this.modal.youn = true;
				this.cnt = 0;
			}
		},
	},
	data() {
		return {
			cnt: 0,
			userData: this.$cfg('app').get('user'),
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
			modal: {
				picture: false,
				youn: false,
			},
			youn: "",
		};
	},
};
</script>
<style></style>
