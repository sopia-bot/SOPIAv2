<template>
	<div class="row ma-0" style="height: 100vh; overflow-y: hidden;padding: 2.5rem;">
		<div class="col col-6">
			<card
				style="width:100%"
				header-classes="bg-transparent"
				footer-classes="bg-transparent">
				
				<div slot="header" class="row ma-0 align-items-center justify-content-center mb-0">
					<div class="col col-7">
						<h4 class="py-1 mb-0 ls-1"> {{ $t('spoor.setting.title') }} </h4>
					</div>
					<div class="col text-right">
						<base-button
							@click="spoorSettingSave"
							type="default">{{ $t('save') }}</base-button>
					</div>
				</div>

				<div
					v-for="set in settings"
					:key="set.name"
					class="row ma-0 mb-3 align-items-center justify-content-center ">
					<div class="col col-6">
						<span>{{ set.name }}</span>
					</div>
					<div class="col col-6 text-right">
						<base-switch
							v-if="set.type === 'switch'"
							v-model="set.model[set.key]"
							:ref="set.ref">
						</base-switch>
						<base-input
							v-else-if="set.type === 'input'"
							:type="set.subType"
							v-model="set.model[set.key]"
							:ref="set.ref"></base-input>
						<el-select
							v-else-if="set.type === 'select'"
							class="select-danger"
							v-model="set.model[set.key]">
							<el-option
								v-for="opt in set.items()"
								:key="opt.label"
								:value="opt.value"
								:label="opt.label"
								class="select-danger">
							</el-option>
						</el-select>
						<div 
							v-else-if="set.type === 'slider'"
							class="row ma-0 align-items-center">
							<div class="col col-10 pa-0">
								<base-slider
									v-model="set.model[set.key]"
									class="mr-2"
									:ref="set.ref"></base-slider>
							</div>
							<div class="col pa-0">
								<span>{{ Math.round(set.model[set.key]) }}</span>
							</div>
						</div>
					</div>
				</div>
			</card>
		</div>
		<div class="col col-6">
			World
		</div>
	</div>
</template>
<script>
import { Select, Option } from 'element-ui';
import BaseSlider from '@/components/BaseSlider';

export default {
    name: 'SpoorChat',
	components: {
		[Select.name]: Select,
		[Option.name]: Option,
		BaseSlider,
	},
	methods: {
		spoorSettingSave() {
			this.spoor.effectvolume = Math.round(this.spoor.effectvolume);
			this.spoor.ttsvolume = Math.round(this.spoor.ttsvolume);
			this.$cfg('app').set('spoor', this.spoor);
			this.$notify({
				type: 'success',
				message: this.$t('spoor.save'),
				horizontalAlign: 'right',
				verticalAlign: 'bottom',
			});
		},
	},
	mounted() {
		if ( typeof this.spoor === "undefined" ) {
			this.spoor = {
				'enable': false,
				'type': 'random',
				'minspoon': 1,
				'effectvolume': 50,
				'ttsvolume': 100,
				'toutspoor': 30,
			};
			this.$cfg('app').set('spoor', this.spoor);
		}
		this.settings = [
				{
					name: this.$t('spoor.setting.enable'),
					type: 'switch',
					ref: 'spoor-enable',
					model: this.spoor,
					key: 'enable',
				},
				{
					name: this.$t('spoor.setting.voice-type'),
					type: 'select',
					ref: 'spoor-voice-type',
					items: () => {
						const opts = [];
						opts.push({
							value: "random",
							label: this.$t('spoor.setting.voices.random'),
						});
						Object.keys(this.voices).forEach(v => {
							opts.push({
								value: v,
								label: this.$t(`spoor.setting.voices.${v}`),
							});
						});
						return opts;
					},
					model: this.spoor,
					key: 'type',
				},
				{
					name: this.$t('spoor.setting.minspoon'),
					type: 'input',
					subType: 'number',
					ref: 'spoor-minspoon',
					model: this.spoor,
					key: 'minspoon',
				},
				{
					name: this.$t('spoor.setting.effect-volume'),
					type: 'slider',
					ref: 'spoor-effect-volume',
					model: this.spoor,
					key: 'effectvolume',
				},
				{
					name: this.$t('spoor.setting.tts-volume'),
					type: 'slider',
					ref: 'spoor-effect-volume',
					model: this.spoor,
					key: 'ttsvolume',
				},
				{
					name: this.$t('spoor.setting.toutspoor'),
					type: 'input',
					subType: 'number',
					ref: 'spoor-toutspoor',
					model: this.spoor,
					key: 'toutspoor',
				},
			];
	},
	data() {
		return {
			spoor: this.$cfg('app').get('spoor'),
			voices: this.$s().$sopia.voices,
			settings: [],
		};
	},
}
</script>
