<template>
	<div class="main-content" style="overflow: hidden;">
		<div class="row ma-0">
			<div class="col-4 col-md-3" style="padding-top:20px;">
				<v-jstree
					:data="folderTree"
					:async="folderTreeAsync"
					allow-batch
					whole-row
					ref="tree"
					size="large"
					class="h4 custom text-white"
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
<style scope>
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

.custom .fa-js {
	color: #ffff59;
}

.custom .fa-folder {
	color: #f2a200;
}

.custom span {
	font-weight: 400;
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
		case ".js": return "fab fa-js";
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
			const readdir = (path_, _d = "") => {
				const target = path.join(_d, path_);
				const fll = fs.readdirSync(target);
				const arr = [];

				if ( Array.isArray(fll) ) {
					const fl = fll.sort((a, b) => {
						const statsA = fs.statSync(path.join(target,a));
						const statsB = fs.statSync(path.join(target,b));
						if ( statsA.isDirectory() ) {
							return -1;
						} else if ( statsB.isDirectory() ) {
							return 1;
						}
						return a > b ? 1 : -1;
					});

					fl.forEach(f => {
						const stats = fs.statSync(path.join(target,f));
						const obj = {};

						obj["text"] = f;

						if ( stats.isDirectory() ) {
							obj["icon"] = "fa fa-folder";
							obj["children"] = readdir(path.join(target, f));
						} else {
							obj["icon"] = iconFinder(path.extname(f));
							obj["children"] = [];
						}

						arr.push(obj);
					});
				}

				return arr;
			};
			return readdir(src);
		},
		folderTreeAsync(oriNode, resolve) {
			this.checkFolder()
				.then(() => {
					const o = this.buildFolderTree(this.up('sopia'));
					resolve(o);
				});
		},
	},
	mounted() {
	},
	data() {
		return {
			code: 'const noop = () => {}',
			editorOption: {
				automaticLayout: true,
			},
			folderTree: [], 
		};
	},
}
</script>
