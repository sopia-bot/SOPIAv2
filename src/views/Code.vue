<template>
	<div class="main-content" style="overflow: hidden;">
		<!-- S:ContextMenu -->
		<card class="context" id="context" :style="{ left: cm.left + 'px', top: cm.top + 'px', display: cm.display }">
			<div class="list-group list-group-flush">
				<a class="list-group-item list-group-item-action" href="#" @click="renameShow">{{ $t('code.context.rename') }}</a>
				<a class="list-group-item list-group-item-action" href="#">{{ $t('code.context.delete') }}</a>
			</div>
		</card>
		<!-- E:ContextMenu -->
		<!-- S:RenameInput -->
		<div class="rename-input" :style="{ display: cm.rename.display }" @click="cm.rename.display = 'none'; rename">
			<card :style="{ left: cm.left + 'px', top: cm.top + 'px' }" @click.stop="cm.rename.display = 'block'">
				<input
					ref="rename-input"
					type="text"
					:placeholder="$t('code.context.rename')"
					class="form-control"
					v-model="cm.rename.value"
					@keydown="inputKeyEvt"
					@click.stop="cm.rename.display = 'block'">
			</card>
		</div>
		<!-- E:RenameInput -->
		<div class="row ma-0">
			<div class="col-4 col-md-3" style="padding-top:20px;">
				<v-jstree
					:data="folderTree"
					:async="folderTreeAsync"
					whole-row
					show-checkbox
					ref="tree"
					v-if="jstreeRender"
					:item-events="itemEvents"
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
		FitemClick(node, A, evt) {
			if ( A.isFolder ) {
				// folder something to do.
			} else {
				const file = A.value;
				if ( fs.existsSync(file) ) {
					const data = fs.readFileSync(file, { encoding: 'utf-8' });
					this.code = data;
				} else {
					console.warn(file, 'not exists');
				}
			}
		},
		checkFolder () {
			return new Promise((resolve, reject) => {
				const dist = this.up('sopia');
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
			const ori = this.oriFolderTree;
			const readdir = (path_, _d = "", ori_) => {
				_d = _d || "";
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
						const fullPath = path.join(target,f);
						const stats = fs.statSync(fullPath);
						const obj = {};
						const oriObjIdx = Array.isArray(ori_) ? ori_.findIndex((oo) => {
							if ( oo["value"] === fullPath ) return true;
							if ( oo["value"] === this.cm.rename.value ) return true;
						}) : -1;
						const oriObj = oriObjIdx >= 0 ? ori_[oriObjIdx] : null;

						obj["text"] = f;
						obj["value"] = fullPath;

						if ( ori.length === 0 && fullPath === path.join(this.up('sopia'), 'main.js') ) {
							obj["selected"] = true;
						}

						if ( oriObj ) {
							obj["selected"] = oriObj["selected"] ? true : false;
						}

						if ( stats.isDirectory() ) {
							obj["icon"] = "fa fa-folder";
							obj["children"] = readdir(fullPath, "", oriObj ? oriObj.children : null);
							obj["isFolder"] = true;

							if ( oriObj ) {
								obj["opened"] = oriObj["opened"] ? true : false;
							}
						} else {
							obj["icon"] = iconFinder(path.extname(f));
							obj["children"] = [];

							if ( obj["selected"] === true ) {
								const file = obj["value"];
								if ( fs.existsSync(file) ) {
									const data = fs.readFileSync(file, { encoding: 'utf-8' });
									this.code = data;
								} else {
									console.warn(file, 'not exists');
								}
							}
						}

						arr.push(obj);
					});
				}

				return arr;
			};
			return readdir(src, "", ori);
		},
		folderTreeAsync(oriNode, resolve) {
			this.checkFolder()
				.then(() => {
					const o = this.buildFolderTree(this.up('sopia'));
					resolve(o);
				});
		},
		itemContextMenu(item, A, evt) {
			let x = evt.x;
			let y = evt.y;

			evt.target.click();
			if ( this.$sidebar.isMinimized ) {
				x -= 62;
			} else {
				x -= 250;
			}
			this.cm.left = x;
			this.cm.top = y;
			this.cm.display = "block";

			this.cm.target = item;
			evt.preventDefault();
		},
		inputKeyEvt(evt) {
			switch(evt.keyCode) {
				case 13: // Enter
					this.rename();
				case 27: // ESC
					this.cm.rename.display = 'none';
					break;
			}
		},
		renameShow() {
			this.cm.rename.display = 'block';
			setTimeout(() => {
				this.cm.rename.value = this.cm.target.data.text;
				this.$refs['rename-input'].focus();
			}, 50);
		},
		rename() {
			const A = this.cm.target.data;
			const fullPath = A.value;
			const dir = path.dirname(fullPath);
			const dst = this.cm.rename.value;
			const dstPath = path.join(dir, dst);

			fs.renameSync(fullPath, dstPath);

			this.cm.rename.value = fullPath;
			this.oriFolderTree = this.folderTree;
			this.folderTree = this.buildFolderTree(this.up('sopia'));
			this.$refs.tree.handleAsyncLoad(this.folderTree, this.$refs.tree);
			this.jstreeForceRenderer();
		},
		jstreeForceRenderer() {
			this.jstreeRender = false;
			this.$nextTick(() => {
				this.jstreeRender = true;
			});
		}
	},
	mounted() {
		document.addEventListener('click', () => {
			if ( this.cm && this.cm.display ) {
				this.cm.display = "none";
				//this.cm.target = null;
			}
		});
	},
	data() {
		return {
			code: '',
			editorOption: {
				automaticLayout: true,
			},
			folderTree: [], 
			oriFolderTree: [],
			selected: null,
			itemEvents: {
				contextmenu: this.itemContextMenu,
			},
			cm: {
				left: 0,
				top: 0,
				display: 'none',
				target: null,
				rename: {
					display: 'none',
					value: '',
				},
			},
			jstreeRender: true,
		};
	},
}
</script>
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

.custom li.tree-node {
	background-image: none !important;
}

.context {
	display: block;
	position: absolute;
	z-index: 100;
	min-width: 100px;
	margin-bottom: unset;
	font-size: 10pt;
}
.context > .card-body {
	padding: 0rem;
}
.context > .card-body .list-group-item {
	padding: 0.5rem;
}
.rename-input {
	width:100%;
	height:100vh;
	position: absolute;
	z-index: 999;
	background: rgba(0, 0, 0, 0.5);
}
.rename-input .card {
	display: inline-block;
	border-radius: 0;
	background: rgba(67, 72, 102, 0.7);
}
.rename-input .card,
.rename-input .form-group,
.rename-input .form-group .valid-feedback {
	margin-top:0;
	margin-bottom:0;
}
.rename-input .card-body {
	padding: 5px;
}
.rename-input input.form-control {
	background: transparent;
	padding: 0 5px;
	height: 30px;
	border-radius: 0;
	color: white;
}
.rename-input input.form-control:focus {
	background: rgba(67, 72, 102, 0.7);
}
</style>
