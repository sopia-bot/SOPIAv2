<template>
	<div class="card card-profile">

		<div class="row justify-content-center">
			<div class="col-lg-3 order-lg-2">
				<div class="card-profile-image">
					<a href="#" @click="modal.picture = true">
						<img :src="userData.profile_url" class="rounded-circle">
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
	</div>
</template>
<script>
export default {
	name: 'UserCard',
	data() {
		return {
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
			},
		};
	},
};
</script>
<style></style>
