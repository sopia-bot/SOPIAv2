<template>
	<div>
		<modal :show.sync="modals.createBundle">
			<template slot="header">
				<h5 class="modal-title"> {{ $t('bundle.new-bundle.title') }} </h5>
			</template>
			<div class="container">
				<div class="row ma-0 mb-3">
					<div class="col col-12 pa-0">
						<base-input
							:placeholder="$t('bundle.new-bundle.bundle-name')"
							v-model="bundles.title"
							input-classes="from-control-muted"></base-input>
					</div>
				</div>
				<div class="row ma-0 mb-3">
					<div class="col col-12 pa-0">
						<base-input
							:placeholder="$t('bundle.new-bundle.desc')"
							v-model="bundles.desc"
							input-classes="from-control-muted"></base-input>
					</div>
				</div>
				<div class="row ma-0 mb-3 align-items-center">
					<div class="col col-5 pa-0 text-center">
						<p>{{ $t('bundle.new-bundle.bundle-key') }}</p>
					</div>
					<div class="col col-7 pa-0 text-right">
						<base-input
							:placeholder="$t('bundle.new-bundle.key-rule')"
							v-model="bundles.key"
							input-classes="from-control-muted"></base-input>
					</div>
				</div>
				<div class="row ma-0 mb-2 align-items-center">
					<div class="col col-5 pa-0 text-center">
						<span>{{ $t('bundle.permission.title') }}</span>
					</div>
					<div class="col col-7 pa-0 text-right">
						<el-select
							class="select-danger"
							style="width: 100%;"
							v-model="bundles.permission">
							<el-option
								v-for="opt in permissions"
								:value="opt.value"
								:label="$t('bundle.permission.'+opt.value)"
								class="select-danger"
								:key="opt.value" />
						</el-select>
					</div>
				</div>
				<div class="row ma-0 align-items-center">
					<div class="col col-5 pa-0 text-center">
						<p>{{ $t('bundle.new-bundle.use-vue') }}</p>
					</div>
					<div class="col col-7 pa-0 text-right pt-3">
						<base-switch v-model="bundles.useVue"></base-switch>
					</div>
				</div>
			</div>
			<template slot="footer">
				<base-button type="secondary" @click="modals.createBundle = false;"> {{ $t('cancel') }} </base-button>
				<base-button type="primary" @click="createBundle"> {{ $t('bundle.new-bundle.make') }} </base-button>
			</template>
		</modal>
		<modal :show.sync="modals.error"
			gradient="danger"
            modal-classes="modal-danger modal-dialog-centered">
			<h6 slot="header" class="modal-title" id="modal-title-notification">{{ $t('error') }}</h6>

            <div class="py-3 text-center">
                <i class="ni ni-bell-55 ni-3x"></i>
                <h4 class="heading mt-4">{{ errDesc }}</h4>
            </div>

            <template slot="footer">
                <base-button type="link"
                             class="ml-auto text-white"
                             @click="modals.error = false">
                    {{ $t('close') }}
                </base-button>
            </template>
		</modal>
	</div>
</template>
<script>
import { Select, Option } from 'element-ui';
import fs from 'fs';
import path, { join } from 'path';

export default {
	name: 'CreateBundleModal',
	components: {
		[Select.name]: Select,
		[Option.name]: Option,
	},
	methods: {
		createBundle() {
			const bundles = this.bundles;
			if ( bundles.title.trim() === "" ||
				 bundles.desc.trim() === "" ||
				 bundles.key.trim() === "" ) {
				this.errDesc = this.$t('bundle.new-bundle.should-not-empty');
				this.modals.error = true;
				return;
			}

			const keyFilter = bundles.key.replace(/([a-z]|-)/g, "");
			if ( keyFilter.length > 0 ) {
				this.errDesc = this.$t('bundle.new-bundle.should-match-rule');
				this.modals.error = true;
				return;
			}

			const bundleFolder = this.up(path.join('bundles', bundles.key));

			if ( fs.existsSync(bundleFolder) ) {
				this.errDesc = this.$t('bundle.new-bundle.exist-bundle');
				this.modals.error = true;
				return;
			}

			fs.mkdirSync(bundleFolder);

			const indexPath = path.join(bundleFolder, 'index.js');
			const readmePath = path.join(bundleFolder, 'README.md');
			const configPath = path.join(bundleFolder, 'config.json');

			bundles.config = {
				permission: bundles.permission,
				name: bundles.title,
				key: bundles.key,
				desc: bundles.desc,
				useVue: bundles.useVue,
				dep: {},
				version: '1.0',
				reqVer: '1.0.0',
			};

			fs.writeFileSync(indexPath, `// ${bundles.title}\nconsole.log('${bundles.title}');`, { encoding: 'utf8' });
			fs.writeFileSync(readmePath, `# ${bundles.title}`, { encoding: 'utf8' });
			fs.writeFileSync(configPath, JSON.stringify(bundles.config, null, '\t'), { encoding: 'utf8' });

			if ( bundles.useVue ) {
				const vuePath = path.join(bundleFolder, 'App.vue');
				let vueString = "";
				vueString += "<template>\n";
				vueString += `	<div>${bundles.title}</div>\n`;
				vueString += "</template>\n";
				vueString += "<script>\n";
				vueString += "export default {\n";
				vueString += "\n";
				vueString += "};\n";
				vueString += "<\/script>";
				fs.writeFileSync(vuePath, vueString, { encoding: 'utf8' });
			}
			
			this.$logger.success('bundle', `${bundles.title} 번들 생성에 성공했습니다.`, bundles);
			this.$assign(`/code/bundles/${bundles.key}/index.js`);
		},
	},
	mounted() {
		this.$evt.$on('create-bundle', (evt) => {
			switch ( evt.type ) {
				case "show":
					this.bundles = {
						title: '',
						permission: 'all',
						desc: '',
						key: '',
						useVue: false,
					},
					this.modals.createBundle = true;
					break;
				case "close":
					this.modals.createBundle = false;
					break;
			}
		});
	},
	data() {
		return {
			modals: {
				createBundle: false,
				error: false,
			},
			bundles: {
				title: '',
				permission: 'all',
				desc: '',
				key: '',
				useVue: false,
			},
			permissions: [
				{ value: 'all', },
				{ value: 'manager', },
				{ value: 'dj', },
				{ value: 'admin', },
			],
			errDesc: '',
		};
	},
}
</script>
