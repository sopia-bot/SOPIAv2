<template>
	<div class="main-content">
		<div class="row" style="width:100%">
			<div class="col">
				<MonacoEditor v-model="code" language="javascript" style="width:600px; height: 600px;" />
			</div>
		</div>
	</div>
</template>
<script>
import MonacoEditor from 'vue-monaco';

export default {
    name: 'Code',
	components: {
		MonacoEditor,
	},
	data() {
		return {
			code: 'const noop = () => {}',
		};
	},
}
</script>
