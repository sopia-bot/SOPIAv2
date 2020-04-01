<template>
<div>
	<VueLoadingButton
		class="btn base-button btn-secondary"
		@click.native="handleClick"
		:loading="this.isLoading"
		>Test</VueLoadingButton>
	<base-button type="secondary" native-type="button" class="text-orange">{{ $t('login.login') }}</base-button>
	</div>
</template>
<script>
import VueLoadingButton from 'vue-loading-button';

export default {
	name: 'Spoon',
	components: {
		VueLoadingButton,
	},
	methods: {
		handleClick() {
			this.isLoading = true;
			setTimeout(() => {
				this.isLoading = false;
			}, 5000)
		}
	},
	mounted() {
	},
	data() {
		return {
			isLoading: false,
		};
	},
}
</script>
