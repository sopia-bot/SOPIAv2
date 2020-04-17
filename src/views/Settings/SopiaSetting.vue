<template>
	<card>
		<div slot="header" class="row align-items-center">
			<div class="col-8">
				<h3 class="mb-0"> {{ $t('setting.sopia.title') }} </h3>
			</div>
			<div class="col-4 text-right">
				<button @click="saveSetting" class="btn btn-sm btn-default">Save</button>
			</div>
		</div>

		<!-- S:Only Manager -->
		<div class="row justify-content-center mb-3">
			<div class="col col-8">
				{{ $t('setting.sopia.onlymanager') }}
			</div>
			<div class="col col-4 text-right">
				<base-switch v-model="sopia.onlymanager"></base-switch>
			</div>
		</div>
		<!-- E:Only Manager -->
		<!-- S:Country -->
		<div class="row justify-content-center align-items-center">
			<div class="col col-8">
				{{ $t('setting.sopia.country') }}
			</div>
			<div class="col col-4 text-right">
				<el-select
					class="select-danger"
					v-model="sopia.country">
					<el-option
						v-for="country in countrys"
						:key="country.value"
						:value="country.value"
						:label="country.label"
						class="select-danger">
					</el-option>
				</el-select>
			</div>
		</div>
		<!-- E:Country -->
	</card>
</template>
<script>
import { Select, Option } from 'element-ui';

export default {
	components: {
		[Select.name]: Select,
		[Option.name]: Option,
	},
	methods: {
		saveSetting() {
			this.$cfg('app').set('sopia', this.sopia);
		},
	},
	data() {
		return {
			sopia: {
				onlymanager: this.$cfg('app').get('sopia.onlymanager'),
				country: this.$cfg('app').get('sopia.country') || "kr",
			},
			countrys: [
				{ label: "한국", value: "kr" },
			],
		};
	},
};
</script>
<style></style>
