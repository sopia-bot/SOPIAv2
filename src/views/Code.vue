<template>
	<div class="main-content">
		<div class="row ma-0">
			<div class="col-4 col-md-3 pa-0" style="padding-top:20px">
				<v-jstree
					:data="folderTree"
					allow-batch
					whole-row
					size="large"
					class="text-white"
					style="height: 100%; overflow-x: auto;"
					@item-click="FitemClick" />
			</div>
			<div class="col-8 col-md-9 pa-0">
				<MonacoEditor
					ref="code-editor"
					class="editor"
					v-model="code"
					language="javascript"
					:options="editorOption"/>
			</div>
		</div>
	</div>
</template>
<style>
.editor {
	width: 100%;
	height: 100vh;
}
.editor > .monaco-editor {
	margin: 0;
	width: 100% !important;
}
.editor > .monaco-editor > .overflow-guard {
	margin: 0;
	width: 100% !important;
}
</style>
<script>
import MonacoEditor from 'vue-monaco';
import VJstree from 'vue-jstree';

export default {
    name: 'Code',
	components: {
		MonacoEditor,
		VJstree,
	},
	methods: {
		FitemClick(evt) {
			console.log(evt);
		}
	},
	mounted() {
	},
	data() {
		return {
			code: 'const noop = () => {}',
			editorOption: {
				automaticLayout: true,
			},
			folderTree: [
				{
					"text": "Hello",
					"icon": "fa fa-folder text-green",
					"children": [
						{
							"text": "custom icon",
							"icon": "fa fa-warning",
							"children": [
								{
									"text": "deep child",
									"children": [
										{
											"text": "real deep deep",
											"children": [
												{
													"text": "real deep deep"
												}
											]
										}
									]
								}
							]
						}
					]
				},
			]
		};
	},
}
</script>
