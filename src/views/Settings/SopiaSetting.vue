<template>
	<card>
	<div slot="header" class="row align-items-center">
		<div class="col-8">
			<h3 class="mb-0"> {{ $t('setting.sopia.title') }} </h3>
		</div>
		<div class="col-4 text-right">
			<a href="#" class="btn btn-sm btn-primary">Save</a>
		</div>
	</div>

	<div class="pl-lg-4">
		<div class="row">
			<div class="col-lg-6">
				<base-input
					type="text"
					label="Username"
					placeholder="Username"
					v-model="user.username"
					>
				</base-input>
			</div>
			<div class="col-lg-6">
				<base-input
					type="email"
					label="Email address"
					placeholder="mike@email.com"
					v-model="user.email"
					>
				</base-input>
			</div>
		</div>
		<div class="row">
			<div class="col-lg-6">
				<base-input
					type="text"
					label="First Name"
					placeholder="First Name"
					v-model="user.firstName"
					>
				</base-input>
			</div>
			<div class="col-lg-6">
				<base-input
					type="text"
					label="Last Name"
					placeholder="Last Name"
					v-model="user.lastName"
					>
				</base-input>
			</div>
		</div>
	</div>

	</card>
</template>
<script>
export default {
	data() {
		return {
			user: {
				company: 'Creative Code Inc.',
				username: 'michael23',
				email: '',
				firstName: 'Mike',
				lastName: 'Andrew',
				address: 'Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09',
				city: 'New York',
				country: 'USA',
				postalCode: '',
				aboutMe: `Lamborghini Mercy, Your chick she so thirsty, I'm in that two seat Lambo.`
			}
		};
	},
	methods: {
	}
};
</script>
<style></style>
