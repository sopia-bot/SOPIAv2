<template>
	<div class="row ma-0" style="height: 100vh; overflow-y: auto;padding: 2.5rem;">
		<div class="col col-12 pt-4">
			<div class="row ma-0" style="height: 100%">
				<div
					v-for="(bundle, idx) in bundles"
					:key="bundle.key"
					class="col col-12 col-md-6 col-lg-4 ma-0 mb-4">
					<div
						@click="showBundle(bundle)"
						class="bundle-box">
						<div
							class="row pt-3 ma-0 align-items-center">
							<div class="col col-12 pa-0 ma-0 text-white text-center">
								<h2 class="text-white text-left pl-4">
									{{ bundle.name }}
									<span class="ml-1" style="font-size: 0.85rem; color: #cacaca;">
										{{ bundle.author }}
									</span>
								</h2>
							</div>
						</div>
						<div
							class="row py-2 ma-0"
							style="height: 130px">
							<div class="col col-12 pa-0 ma-0 text-white px-4">
								<p class="bundle-content">{{ bundle.desc }}</p>
							</div>
						</div>
						<div class="row pb-3 ma-0">
							<div class="col col-12 pa-0 ma-0 text-white text-right">
								<button
									v-if="bundle.isLocal"
									@click.stop="selectBundle = { bundle, idx }; modals.delete = true;"
									style="font-size: 0.75rem; padding: 0.5rem 1rem;"
									class="btn base-button mr-2 btn-danger">{{ $t('delete') }}</button>
								<button
									v-else-if="bundle.enabled"
									@click.stop=""
									style="font-size: 0.75rem; padding: 0.5rem 1rem;"
									class="btn base-button mr-2 btn-info">{{ $t('enabled') }}</button>
								<button
									v-else
									@click.stop=""
									style="font-size: 0.75rem; padding: 0.5rem 1rem;"
									class="btn base-button mr-2 btn-secondary">{{ $t('enable') }}</button>
							</div>
						</div>
					</div>
				</div>
				
				<div class="col col-12 col-md-6 col-lg-4 ma-0 mb-4">
					<div class="row align-items-center py-6 ma-0 new-bundle-box" @click="createBundleProject">
						<div class="col col-12 pa-0 ma-0 text-white text-center">
							<i class="fas fa-plus-circle"></i>
							<p class="mb-0 mt-2">{{ $t('bundle.new-bundle.title') }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<create-bundle-modal />
		<!-- S:Confirm -->
		<modal :show.sync="modals.delete">
            <h6 slot="header" class="modal-title">{{ $t('bundle.delete.title') }}</h6>

            <p>{{ $t('bundle.delete.confirm') }}</p>

            <template slot="footer">
                <base-button type="warning" class="ml-auto" @click="deleteBundle(selectBundle.bundle, selectBundle.idx); modals.delete = false;">OK</base-button>
                <base-button type="link" class="ml-2" @click="modals.delete = false">Cancel</base-button>
            </template>
        </modal>
		<!-- E:Confirm -->
		<modal v-if="modals.detail" :show.sync="modals.detail">
			<template slot="header">
				<h5 class="modal-title"> {{ selectBundle.name }} </h5>
			</template>
			<BundleDetail :bundle.sync="selectBundle" />
		</modal>
	</div>
</template>
<script>
import CreateBundleModal from './Bundles/CreateBundle';
import BundleDetail from './Bundles/BundleDetail';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

export default {
	name: 'Bundle',
	components: {
		CreateBundleModal,
		BundleDetail,
	},
	methods: {
		createBundleProject() {
			this.$evt.$emit('create-bundle', {
				type: 'show',
			});
		},
		showBundle(bundle) {
			this.selectBundle = bundle;
			this.modals.detail = true;
		},
		deleteBundle(bundle, idx) {
			this.bundles.splice(idx, 1);
			const p = this.up('bundles', bundle.key);
			rimraf.sync(p);
		},
		getLocalBundles() {
			const bundlePath = this.up('bundles');
			const dirs = fs.readdirSync(bundlePath);

			const bundles = [];

			for ( const dir of dirs ) {
				const target = path.join(bundlePath, dir);
				const configPath = path.join(target, 'config.json');

				if ( fs.existsSync(configPath) ) {
					// 로컬에서 생성한 번들
					const config = this.json(configPath);
					config.isLocal = true;
					bundles.push(config);
				} else {
					// 다운로드한 번들
				}
			}
			return bundles;
		},
	},
	mounted() {
		let tmp = [];
		const localBundles = this.getLocalBundles();
		tmp = tmp.concat(localBundles);

		this.bundles = tmp;
	},
	data() {
		return {
			modals: {
				delete: false,
				detail: false,
			},
			bundles: [],
			selectBundle: {},
		};
	},
}
</script>
<style scoped>
.bundle-box {
	border: solid 1px #afafaf !important;
	cursor: pointer;
	height: 230px;
	background-color: rgba(0, 0, 0, 0.5);
}
.bundle-box:hover {
	background-color: rgba(30, 30, 45, 0.7);
}
.bundle-content {
	font-weight: 400;
    text-overflow: ellipsis;
    width: 100%;
    word-break: break-all;
    overflow: hidden;
	height: 110px;
}

.new-bundle-box {
	border: dashed 1px #afafaf !important;
	cursor: pointer;
	height: 230px;
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
