<template>
	<!-- S:Container -->
	<div class="container-fluid pt-5">
		<!-- S:Row -->
		<div class="row">
			<div class="col-xl-4 order-xl-2">
				<user-card></user-card>
			</div>
			<div class="col-xl-8 order-xl-1">
				<!-- S:Row -->
				<div class="row">
					<div class="col-lg-6">

					<card gradient="info" class="border-0">
						<div class="row">
						<div class="col">
							<h5 class="card-title text-uppercase text-muted mb-0 text-white">Total traffic</h5>
							<span class="h2 font-weight-bold mb-0 text-white">350,897</span>
						</div>
						<div class="col-auto">
							<div class="icon icon-shape bg-white text-dark rounded-circle shadow">
							<i class="ni ni-active-40"></i>
							</div>
						</div>
						</div>
						<p class="mt-3 mb-0 text-sm">
						<span class="text-white mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
						<span class="text-nowrap text-light">Since last month</span>
						</p>
					</card>

					</div>
					<div class="col-lg-6">
						<!-- S:Card -->
						<card gradient="danger" class="border-0">
							<div class="row">
								<div class="col">
									<h5 class="card-title text-uppercase text-muted mb-0 text-white">Performance</h5>
									<span class="h2 font-weight-bold mb-0 text-white">49,65%</span>
								</div>
								<div class="col-auto">
									<div class="icon icon-shape bg-white text-dark rounded-circle shadow">
									<i class="ni ni-spaceship"></i>
									</div>
								</div>
							</div>
							<p class="mt-3 mb-0 text-sm">
								<span class="text-white mr-2"><i class="fa fa-arrow-up"></i> 3.48%</span>
								<span class="text-nowrap text-light">Since last month</span>
							</p>
						</card>
						<!-- E:Card -->
					</div>
				</div>
				<!-- E:Row -->
				<edit-profile-form></edit-profile-form>
			</div>
		</div>
		<!-- E:Row -->
	</div>
	<!-- E:Container -->
</template>
<script>
import EditProfileForm from './UserProfile/EditProfileForm.vue';
import UserCard from './UserProfile/UserCard.vue';
export default {
	name: 'Setting',
	components: {
		EditProfileForm,
		UserCard,
	},
}
</script>