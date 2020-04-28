<template>
	<div class="row ma-0" style="height: 100vh; overflow-y: hidden;padding: 2.5rem;">
		<div class="col col-12">
			<div class="row ma-0" style="height: 100%">
				
				<div class="col col-12 col-md-6 col-lg-4 ma-0">
					<div class="row align-items-center py-6 ma-0 new-bundle-box" @click="createBundleProject">
						<div class="col col-12 pa-0 ma-0 text-white text-center">
							<i class="fas fa-plus-circle"></i>
							<p class="mb-0 mt-2">{{ $t('bundle.new-bundle.title') }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<modal :show.sync="modals.createBundle">
			<template slot="header">
				<h5 class="modal-title"> {{ $t('bundle.new-bundle.title') }} </h5>
			</template>
			<div>
				<base-input
					:placeholder="$t('bundle.new-bundle.bundle-name')"
					input-classes="from-control-muted"></base-input>
			</div>
			<template slot="footer">
				<base-button type="secondary" @click="modals.createBundle = false;"> {{ $t('cancel') }} </base-button>
				<base-button type="primary"> {{ $t('bundle.new-bundle.make') }} </base-button>
			</template>
		</modal>
	</div>
</template>
<script>
import CreateBundleModal from './Bundles/CreateBundle';

export default {
	name: 'Bundle',
	components: {
		CreateBundleModal,
	},
	methods: {
		createBundleProject() {
			this.modals.createBundle = true;
		},
	},
	mounted() {
	},
	data() {
		return {
			modals: {
				createBundle: false,
			},
		};
	},
}
</script>
<style scoped>
.new-bundle-box {
	border: dashed 1px #afafaf !important;
	cursor: pointer;
}
.new-bundle-box svg {
	width: 35px;
	height:35px;
	font-size: 16pt;
}
.new-bundle-box:hover {
	background-color: rgba(94, 114, 228, 0.1);
}
</style>
