<template>
	<div class="main-content">
		<div class="row ma-0">
			<div class="col-4 col-md-3" style="padding-top:20px; background-color:white;">
				<v-jstree
					:data="folderTree"
					allow-batch
					whole-row
					size="large"
					class="text-black h4"
					style="height: 100%; overflow-x: auto; font-weight:300"
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

li.tree-node {
	background-image: none !important;
}
</style>
<script>
import MonacoEditor from 'vue-monaco';
import VJstree from 'vue-jstree';
import fs from 'fs';
import path from 'path';
import { ncp } from 'ncp';

const iconFinder = (ext) => {
	switch (ext) {
		case ".js": return "fa fa-js";
	}
	return "fa fa-file";
};

export default {
    name: 'Code',
	components: {
		MonacoEditor,
		VJstree,
	},
	methods: {
		FitemClick(evt) {
			console.log(evt);
		},
		checkFolder () {
			return new Promise((resolve, reject) => {
				const dist = path.join(this.$store.getters.udpath, 'sopia');
				if ( !fs.existsSync(dist) ) {
					const src = this.p('sopia');
					ncp(src, dist, () => {
						resolve();
					});
				} else {
					resolve();
				}
			});
		},
		buildFolderTree(src) {
		}
	},
	mounted() {
		console.log(this.$store.getters.udpath);
		this.checkFolder()
			.then(() => {
			});
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
							"children": [
								{
									"text": "deep child",
									"children": [
										{
											"text": "real deep deep",
											"children": [
												{
													"text": "real deep deep",
													"children": []
												},
												{
													"text": "real deep deep",
													"children": [
														{
															"text": "real deep deep",
															"children": []
														}
													]
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
