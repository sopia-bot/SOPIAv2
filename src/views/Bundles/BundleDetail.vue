<template>
	<div class="d-block" style="overflow: auto; max-height: 60vh">
		<h5
			class="text-black-50"
			style="width:100%; overflow:hidden; word-break: break-all;">{{ bundle.desc }}</h5>
		<div class="row align-items-center ma-0 mt-4">
			<div class="col">
				<small>{{ $t('author') }}</small>
				<h5 class="mb-0">{{ bundle.author }}</h5>
			</div>
			<div class="col">
				<small>{{ $t('bundle.permission.title') }}</small>
				<h5 class="mb-0">{{ $t('bundle.permission.' + bundle.permission) }}</h5>
			</div>
			<div class="col">
				<small>{{ $t('version') }}</small>
				<h5 class="mb-0">{{ bundle.version }}</h5>
			</div>
			<div class="col">
				<small>{{ $t('req-ver') }}</small>
				<h5 class="mb-0">{{ bundle.reqVer }}</h5>
			</div>
		</div>

		<div class="row ma-0 mt-6">
			<div class="col col-12">
				<div  class="md-custom">
					<vue-markdown :source="readme"></vue-markdown>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import VueMarkdown from 'vue-markdown';
import path from 'path';
import fs from 'fs';

export default {
	name: 'BundleDetail',
	props: ['bundle'],
	components: {
		VueMarkdown,
	},
	mounted() {
		if ( this.bundle.key ) {
			const bundlePath = this.up('bundles', this.bundle.key);
			const readmePath = path.join(bundlePath, 'README.md');

			if ( fs.existsSync(readmePath) ) {
				fs.readFile(readmePath, {encoding:'utf8'}, (err, data) => {
					this.readme = data;
				});
			}
		}
	},
	data() {
		return {
			readme: '',
		};
	},
}
</script>
<style scope>
.md-custom img {
	max-width:100% !important;
}
</style>
