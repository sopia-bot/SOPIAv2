<template>
	<div class="main-content" style="overflow: hidden;">
		<!-- S:ContextMenu -->
		<card class="context" id="context" :style="{ left: cm.left + 'px', top: cm.top + 'px', display: cm.display }">
			<div class="list-group list-group-flush">
				<a class="list-group-item list-group-item-action" href="#" @click="inputShow('newFile')">{{ $t('code.context.newfile') }}</a>
				<a class="list-group-item list-group-item-action" href="#" @click="inputShow('newFolder')">{{ $t('code.context.newfolder') }}</a>
				<a class="list-group-item list-group-item-action" href="#" @click="inputShow('rename')">{{ $t('code.context.rename') }}</a>
				<a class="list-group-item list-group-item-action" href="#" @click="unlink">{{ $t('code.context.delete') }}</a>
			</div>
		</card>
		<!-- E:ContextMenu -->
		<!-- S:RenameInput -->
		<div class="rename-input" :style="{ display: cm.rename.display }" @click="inputFinish">
			<card :style="{ left: cm.left + 'px', top: cm.top + 'px' }" @click.stop="cm.rename.display = 'block'">
				<input
					ref="input"
					type="text"
					class="form-control"
					v-model="cm.rename.value"
					@keydown="inputKeyEvt"
					@click.stop="cm.rename.display = 'block'">
			</card>
		</div>
		<!-- E:RenameInput -->
		<!-- S:Notification -->
		<modal :show.sync="notiShow"
               gradient="danger"
               modal-classes="modal-danger modal-dialog-centered">
            <h6 slot="header" class="modal-title" id="modal-title-notification">{{ $t('code.noti.syntax-error')}}</h6>

            <div class="py-3 text-center">
                <i class="ni ni-bell-55 ni-3x"></i>
                <h4 class="heading mt-4">{{ $t('code.noti.check-line')}} &lt;{{ notification.line }}&gt;</h4>
                <pre class="text-white">{{ notification.syntax }}</pre>
				<p>{{ notification.msg }}</p>
            </div>

            <template slot="footer">
                <base-button type="link"
                             class="ml-auto text-white"
                             @click="notiShow = false">
                    Close
                </base-button>
            </template>
        </modal>
		<!-- S:Notification -->
		<div class="row ma-0" style="height: 100vh">
			<div class="col-4 col-md-3" style="padding-top:20px; height: 100%;">
				<div class="row ma-0 mb-3">
					<div class="col col-12 text-right">
						<el-tooltip
							v-for="(item, idx) in toolbarItems"
							:key="item.tooltip+'-'+idx"
							:content="item.tooltip"
							placement="bottom">
							<base-button
								@click="item.click"
								type="secondary"
								:class="item.classes"
								class="ml-3"
								size="sm">
								<i :class="item.icon"></i>
							</base-button>
						</el-tooltip>
					</div>
				</div>
				<div class="row ma-0" style="height: 100%; overflow: auto;">
					<div class="col col-12">
						<div v-if="treeRenderer">
							<tree
								class="custom"
								ref="tree"
								:key="folderKey"
								:data.sync="folderTree">
								<span class="tree-text" slot-scope="{ node }">
									<!-- S:Folder -->
									<template v-if="node.hasChildren()">
										<div @contextmenu.stop="itemContextMenu($event, node)">
											{{ node.text }}
										</div> 
									</template>
									<!-- E:Folder -->

									<!-- S:File -->
									<template v-else>
										<div @contextmenu.stop="itemContextMenu($event, node)">
											<i :class="node.data.icon"></i>
											{{ node.text }}
										</div>
									</template>
									<!-- E:File -->
								</span>
							</tree>
						</div>
					</div>
				</div>
			</div>
			<div class="col-8 col-md-9 pa-0" style="background-color: #252526;">
				<div
					v-if="openedTabs.length > 0"
					class="row ma-0">
					<div class="col col-12 pa-0 ma-0" style="background-color: #2D2D2D; max-width: 100%;">
						<div class="d-flex" style="min-height: calc( 23px + 1.4rem ); overflow-x: auto;">
							<div
								v-for="(tab, idx) in openedTabs"
								:key="idx + 'tab' + tab.data.value"
								class="d-inline-flex text-white align-items-center custom"
								:style="{ backgroundColor: tab.data.value === selectPath ? '#1E1E1E' : 'transparent' }"
								@click="FitemClick(tab)"
								style="padding: 0.7rem 1.5rem; cursor: pointer;">
								<i :class="iconFinder(extname(tab.data.value))"></i>
								<p class="mx-2" style="pointer-events: none; font-size: 0.85rem;">{{ tab.text }}</p>
								<i @click.stop="closeTab(tab, idx)" class="ni ni-fat-remove" style="cursor: pointer;"></i>
							</div>
						</div>
					</div>
				</div>
				<div class="row ma-0 align-items-center" style="height: 100%;">
					<div
						v-if="openedTabs.length > 0"
						class="col col-12 ma-0 pa-0"
						style="height:100%; box-shadow: 5px 0px 2px 3px black;">
						<MonacoEditor
							ref="code-editor"
							class="editor"
							v-model="editor.code"
							:language="editor.language"
							@editorDidMount="editorDidMount"
							:theme="editor.theme"
							:options="editor.options"/>
					</div>
					<div
						v-else
						class="col col-12 text-center"
						style="pointer-events: none;">
						<h1 style="color: #848484; pointer-events: none;">{{ $t('code.not-opened') }}</h1>
						<p
							v-for="desc in $t('code.open-desc')"
							:key="desc"
							style="color: #848484; pointer-events: none;">{{ desc }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import MonacoEditor from 'vue-monaco';
import fs from 'fs';
import path from 'path';
import { ncp } from 'ncp';
import rimraf from 'rimraf';
import { shell } from 'electron';

const iconFinder = (ext) => {
	switch (ext.toLowerCase()) {
		case ".md": return "fab fa-markdown";
		case ".js": return "fab fa-js";
		case ".vue": return "fab fa-vuejs";
		case ".json": return "fas fa-bullseye";
		case ".html": return "fab fa-html5";
	}
	return "fa fa-file";
};

const getLanguage = (ext) => {
	switch (ext.toLowerCase()) {
		case ".js": return "javascript";
		case ".json": return "json";
		case ".md": return "markdown";
		case ".vue":
		case ".html":
			return "html";
	}
	return "javascript";
}

export default {
    name: 'Code',
	components: {
		MonacoEditor,
	},
	created() {
		let folder = this.$route.params.folder;
		if ( folder === undefined || folder === "" ) {
			folder = "sopia";
		}
		let target = "";

		const dirS = folder.split('/');
		if ( dirS.length > 1 ) {
			folder = dirS.shift();
			target = dirS.join('/');
		}
		
		this.targetFolder = folder;
	},
	watch: {
		'$route' (to, from) {
			const folder = to.params.folder;
			if ( folder === undefined || folder === "" ) {
				folder = "sopia";
			}
			this.targetFolder = folder;
			this.treeReload();
		},
	},
	methods: {
		iconFinder,
		extname: path.extname,
		FitemClick(node) {
			if ( node.data.isFolder ) {
				// folder something to do.
			} else {
				const file = node.data.value;

				const idx = this.openedTabs.findIndex((tab) => tab.data.value === file);
				if ( idx === -1 ) {
					this.openedTabs.push(node);
				}
				if ( fs.existsSync(file) ) {
					const data = fs.readFileSync(file, { encoding: 'utf-8' });
					this.editor.code = data;
					this.editor.language = getLanguage(path.extname(file));
					this.selectPath = file;

					node.select();
					
					localStorage.setItem(`${this.targetFolder}-last-select`, file);
				} else {
					console.warn(file, 'not exists');
				}
			}
		},
		closeTab(node, idx) {
			const tmpTabs = this.openedTabs;
			tmpTabs.splice(idx, 1);
			this.editor.code = "";
			if ( tmpTabs.length > 0 ) {
				this.FitemClick(tmpTabs[0]);
			} else {

			}
			this.openedTabs = tmpTabs;
		},
		checkFolder () {
			return new Promise((resolve, reject) => {
				const dist = this.up(this.targetFolder);
				if ( !fs.existsSync(dist) ) {
					const src = this.p(this.targetFolder);
					if ( fs.existsSync(src) ) {
						ncp(src, dist, () => {
							resolve();
						});
					} else {
						fs.mkdir(dist, (err) => {
							if ( err ) {
								reject(err);
								return;
							}
							resolve();
						});
					}
				} else {
					resolve();
				}
			});
		},
		buildFolderTree(src, selectedFile = "") {
			const ori = this.oriFolderTree;
			const readdir = (path_, _d = "", ori_, sf) => {
				_d = _d || "";
				const target = path.join(_d, path_);

				if ( fs.existsSync(target) ) {
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
							const obj = { data: {} };
							const oriObjIdx = Array.isArray(ori_) ? ori_.findIndex((oo) => {
								if ( oo.data["value"] === fullPath ) return true;
								if ( oo.data["value"] === this.cm.rename.value ) return true;
							}) : -1;
							const oriObj = oriObjIdx >= 0 ? ori_[oriObjIdx] : {};

							obj["text"] = f;
							obj.data["value"] = fullPath;

							if ( stats.isDirectory() ) {
								let expanded = false;
								if ( sf.length > 0 ) {
									const p = sf.shift();
									expanded = (p === f);
								} else {
									expanded = (oriObj["states"] && oriObj["states"].expanded);
								}
								obj["state"] = {
									expanded,
								};
								obj.data['isFolder'] = true;
								obj["children"] = readdir(fullPath, "", oriObj && oriObj.children );
								
							} else {
								obj["state"] = oriObj["state"] || {};
								obj.data['isFolder'] = false;
								obj.data["icon"] = iconFinder(path.extname(f));
							}

							arr.push(obj);
						});
					}
					return arr;
				} else {
					this.checkFolder();
					return [];
				}
			};

			const sfs = selectedFile ? selectedFile.split('/') : [];
			return readdir(src, "", ori, sfs);
		},
		itemContextMenu(evt, node) {
			let x = evt.x;
			let y = evt.y;

			if ( window.innerWidth >= 1200 ) {
				if ( this.$sidebar.isMinimized ) {
					x -= 62;
				} else {
					x -= 250;
				}
			}

			this.cm.left = x;
			this.cm.top = y;
			this.cm.display = "block";

			this.cm.target = node;
			evt.preventDefault();
		},
		inputKeyEvt(evt) {
			switch(evt.keyCode) {
				case 13: // Enter
					this[this.inputType]();
				case 27: // ESC
					this.cm.rename.display = 'none';
					break;
			}
		},
		inputShow(type) {
			this.cm.rename.display = 'block';
			this.inputType = type;
			setTimeout(() => {
				if ( type === "rename" ) {
					this.cm.rename.value = this.cm.target.data.text;
				} else {
					this.cm.rename.value = '';
				}
				this.$refs['input'].focus();
			}, 50);
		},
		inputFinish() {
			this.cm.rename.display = 'none';
			this[this.inputType]();
		},
		rename() {
			const A = this.cm.target.data;
			const fullPath = A.value;
			const dir = path.dirname(fullPath);
			const dst = this.cm.rename.value;
			const dstPath = path.join(dir, dst);

			fs.renameSync(fullPath, dstPath);

			this.cm.rename.value = '';
			this.treeReload((tree) => {
				const idx = this.openedTabs.findIndex((tab) => tab.data.value === fullPath);
				if ( idx !== -1 ) {
					this.openedTabs[idx].data.value = dstPath;
					this.openedTabs[idx].text = dst;
					this.selectPath = dstPath;

				}

			});
		},
		unlink() {
			const fullPath = this.cm.target.data.value;
			if ( fs.existsSync(fullPath) ) {
				rimraf.sync(fullPath);
				this.treeReload(() => {
					const idx = this.openedTabs.findIndex((tab) => tab.data.value === fullPath);
					if ( idx !== -1 ) {
						this.closeTab(this.openedTabs[idx], idx);
						this.treeReload();
					}
				});
			} else {
				this.$logger.debug('code', `다음 폴더 또는 파일이 없습니다. ${fullPath}`);
			}
		},
		newFile() {
			if ( this.cm.rename.value.trim() === "" ) return;

			const dirPath = 
				this.cm.target.children.length > 0 ?
					this.cm.target.data.value :
					path.dirname(this.cm.target.data.value);
			const dstPath = path.join(dirPath, this.cm.rename.value);
			fs.writeFileSync(dstPath, '');
			this.selected = dstPath;
			this.treeReload((tree) => {
				const node = this.searchNode(tree.model, dstPath);
				if ( node ) {
					this.FitemClick(node);
				}
			});
		},
		newFolder() {
			if ( this.cm.rename.value.trim() === "" ) return;

			const dirPath = 
				this.cm.target.children.length > 0 ?
					this.cm.target.data.value :
					path.dirname(this.cm.target.data.value);
			const dstPath = path.join(dirPath, this.cm.rename.value);
			fs.mkdirSync(dstPath);
			this.selected = dstPath;
			this.treeReload();
		},
		treeReload(cb = () => {}) {
			this.oriFolderTree = this.$refs.tree.tree.model;
			this.treeRender = false;
			this.folderTree = this.buildFolderTree(this.up(this.targetFolder));
			this.$nextTick()
				.then(() => {
					this.treeRenderer = true;
					this.$forceUpdate();
					this.folderKey += 1;
					

					this.$nextTick()
						.then(() => {
							const tree = this.$refs.tree.tree;
							this.$refs.tree.$on('node:selected', this.FitemClick);

							if ( this.selectPath ) {
								const node = this.searchNode(tree.model, this.selectPath);
								if ( node ) {
									node.select(true);
								}
							}

							cb(tree);
						});
				});
		},
		save(editor) {
			if ( !this.selectPath ) {
				this.$notify({
					type: 'danger',
					message: this.$t('code.noti.not-select-file'),
					horizontalAlign: 'right',
					verticalAlign: 'bottom',
				});
				return;
			}
			try {
				const ext = path.extname(this.selectPath);
				let rtn = { result: true };
				switch ( ext ) {
					case ".js":
					{
						rtn = this.jsSyntax(editor.getValue());
						break;
					}
					case ".json":
					{
						rtn = this.jsSyntax(`JSON.parse(\n${editor.getValue()}\n)`);
						rtn.line -= 1;
						break;
					}
				}
				if ( !rtn.result ) {
					this.notification = rtn;
					this.notiShow = !rtn.result;
					return;
				}

				fs.writeFileSync(this.selectPath, editor.getValue(), {encoding: 'utf8'});
				this.$notify({
					type: 'primary',
					message: this.$t('code.noti.save-success'),
					horizontalAlign: 'right',
					verticalAlign: 'bottom',
				});
			} catch(err) {
				this.$notify({
					type: 'danger',
					message: err.message,
					horizontalAlign: 'right',
					verticalAlign: 'bottom',
				});
				console.error(err);
			}
		},
		editorDidMount(editor) {
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
				this.save(editor);
			});
		},
		searchNode(nodes, value) {
			for ( let node of nodes ) {
				if ( node.children.length === 0 ) {
					// file
					if ( node.data.value === value ) {
						return node;
					}
				} else {
					// folder
					if ( value.match(node.data.value) ) {
						if ( !node.states.expanded ) {
							node.toggleExpand();
						}
						return this.searchNode(node.children, value);
					}
				}
			}
		},
	},
	mounted() {
		document.addEventListener('click', () => {
			if ( this.cm && this.cm.display ) {
				this.cm.display = "none";
				//this.cm.target = null;
			}
		});


		this.treeRenderer = false;
		this.folderTree = this.buildFolderTree(this.up(this.targetFolder), this.$route.params.file);
		this.treeReload((tree) => {
			const folder = this.$route.params.folder;
			const file = this.$route.params.file;
			if ( file ) {
				const fullPath = this.up(path.join(folder, file));
				const t = tree.model;

				const search = (nodes) => {
				};

				const node = this.searchNode(t, fullPath);
				if ( node ) {
					node.select(true);
				}
			}
		});
	},
	data() {
		return {
			editor: {
				options: {
					automaticLayout: true,
				},
				language: 'javascript',
				code: '',
				theme: 'vs-dark',
			},
			folderTree: [],
			folderKey: 0,
			selected: null,
			oriFolderTree: [],
			openedTabs: [],
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
			treeRenderer: true,
			inputType: '',
			selectPath: null,
			notification: { result: true },
			notiShow: false,
			toolbarItems: [
				{
					icon: "far fa-save",
					tooltip: this.$t('code.tooltip.save'),
					classes: "",
					click: () => {
						const refEditor = this.$refs['code-editor'];
						this.save(refEditor.getEditor());
					}
				},
				{
					icon: "far fa-folder-open",
					tooltip: this.$t('code.tooltip.open-folder'),
					classes: "",
					click: () => {
						shell.openItem(this.up(this.targetFolder));
					}
				},
			],
		};
	},
}
</script>
<style scope>
.editor {
	width: 100%;
	height: 100%;
}
.editor > .monaco-editor {
	margin: 0;
	width: 100% !important;
	padding-top: 7px;
}
.editor > .monaco-editor > .overflow-guard {
	margin: 0;
	width: 100% !important;
}
/*
.monaco-scrollable-element {
	background-color: white;
}
*/

.custom .fa-js {
	color: #ffff59;
}

.custom .fa-vuejs {
	color: #41B883;
}

.custom .fa-markdown {
	color: #ff7657;
}

.custom .fa-bullseye {
	color: #5e72e4;
}

.custom .tree-arrow.has-child:after {
	border: 1.5px solid white;
    position: absolute;
    border-left: 0;
    border-top: 0;
    left: 9px;
    top: 50%;
    height: 9px;
    width: 9px;
    transform: rotate(-45deg) translateY(-50%) translateX(0);
    transition: transform .25s;
    transform-origin: center;
}

.custom .tree-anchor .tree-text {
	color: white;
}

.custom .tree-node:not(.selected)>.tree-content:hover {
	background: rgba(55, 55, 75, 0.5);
}

.custom .tree-node.selected>.tree-content {
	background: rgba(75, 75, 105, 0.5);
}

.custom .tree-arrow {
	margin-left: 0px;
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
.el-tooltip__popper {
	margin-top: 10px;
	color: white;
	background: rgba(38, 41, 59, 0.7);
	padding: 0.3rem 0.5rem;
	border: 2px ridge rgba(67, 72, 102, 0.7);
	font-size: 10pt;
	font-weight: bold;
}
</style>
