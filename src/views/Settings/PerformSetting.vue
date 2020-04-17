<template>
	<card>
		<div slot="header" class="row align-items-center">
			<div class="col-8">
				<h3 class="mb-0"> {{ $t('setting.perform.title') }} </h3>
			</div>
			<div class="col-4 text-right">
				<button @click="saveSetting" class="btn btn-sm btn-default">Save</button>
			</div>
		</div>

		<!-- S:Particle -->
		<div class="row justify-content-center align-items-center mb-3">
			<div class="col col-8">
				{{ $t('setting.perform.particle') }}
			</div>
			<div class="col col-4 text-right">
				<el-select
					class="select-danger"
					v-model="perform.particle">
					<el-option
						v-for="p in particles"
						:key="p.value"
						:value="p.value"
						:label="p.label"
						class="select-danger">
					</el-option>
				</el-select>
			</div>
		</div>
		<!-- E:Particle -->
		<!-- S:Live Collect -->
		<div class="row justify-content-center">
			<div class="col col-8">
				{{ $t('setting.perform.live-collect') }}
			</div>
			<div class="col col-4 text-right">
				<base-switch v-model="perform.live"></base-switch>
			</div>
		</div>
		<!-- E:Live Collect -->
	</card>
</template>
<script>
import { Select, Option } from 'element-ui';
import EventBus from '@/plugins/event-bus.js';

export default {
	components: {
		[Select.name]: Select,
		[Option.name]: Option,
	},
	methods: {
		saveSetting() {
			this.$cfg('app').set('perform', this.perform);
			EventBus.$emit('perform-reload');
		},
	},
	data() {
		return {
			perform: {
				particle: this.$cfg('app').get('perform.particle') || 0,
				live: this.$cfg('app').get('perform.live-collect') || true,
			},
			particles: [
				{ label: "사용 안 함", value: 0 },
				{ label: "최하", value: 10 },
				{ label: "하", value: 30 },
				{ label: "중", value: 50 },
				{ label: "상", value: 70 },
				{ label: "최상", value: 100 },
				{ label: "울트라", value: 200 },
			],
		};
	},
};
</script>
<style></style>
