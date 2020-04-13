<template>
	<div class="container" style="height:100vh">
		<div class="row align-items-center justify-content-center" style="height: 100%">
			<div class="col-lg-7 col-md-10">
				<!-- S:Card -->
				<div class="card bg-secondary border-0 mb-0">
					<div class="card-body px-lg-4 py-4">
						<div class="row ma-0">
							<div class="col col-12">
								{{ $t('loading.status.'+status) }}
							</div>
						</div>
						<div v-if="downProgShow" class="row ma-0">
							<div class="col col-12">
								<base-progress
									:animated="downAnimation"
									type="success"
									:height="3"
									:value="downProg"
									label="Task completed"></base-progress>
							</div>
						</div>
					</div>
				</div>
				<!-- E:Card -->
			</div>
		</div>
	</div>
</template>
<script>
import fs from 'fs';
import path from 'path';

const sleep = (delay) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}

const versionCompare = (app, server) => {
	if ( app.app === server.app ) {
		if ( app.major === server.major ) {
			return app.build < server.build;
		} else {
			return app.major < server.major;
		}
	} else {
		return app.app < server.app;
	}
}
export default {
    name: 'Loading',
	methods: {
		async checkUpdate() {
			this.status = "check-update";

			const buildInfo = this.$ver()['build-info'];
			const buildOs = buildInfo.os; 

			const latestVer = await this.$db().get(`/11-app/version/${buildOs.platform}-${buildOs.arch}/`);
			const check = versionCompare(this.$ver(), latestVer);

			if ( check ) {
				// must update!!!
				console.log("must update");
			}

			this.status = "complete";
		},
		async checkFiles() {
			this.status = "check-files";

			const files = await this.$db().get('/11-app/files/');
			const cfs = async (obj, p) => {
				const fl = Object.keys(obj);

				for (let i=0;i<fl.length;i++) {
					const f = fl[i];
					const o = obj[f];
					const target = path.join(p, f);
					if ( o.ext ) {
						// file
						const file = `${target}.${o.ext}`;
						if ( fs.existsSync(file) ) {
							continue;
						}

						this.downProg = 0;
						this.downProgShow = true;
						this.downAnimation = true;

						const { body, headers } = await fetch(o.href)
						const contentLength = parseInt(headers.get('content-length'), 10);
						
						const render = body.getReader();
						let done = false;
						let downloaded = 0;
						do {
							const chunk = await render.read();
							done = chunk.done;
							if ( !done ) {
								downloaded += chunk.value.length;

								this.downProg = Math.round(downloaded / contentLength * 100);
								console.log(this.downProg);

								fs.appendFileSync(file, new Buffer(chunk.value));
							}
						} while ( !done );

						this.downAnimation = false;
						await sleep(300);
						this.downProgShow = false;
						await sleep(50);
					} else {
						// directory
						if ( !fs.existsSync(target) ) {
							fs.mkdirSync(target);
						}
						await cfs(obj[f], target);
					}
				}
			};
			await cfs(files, this.up());

			this.status = "complete";
		},
	},
	async mounted() {
		await this.checkUpdate();
		await this.checkFiles();
	},
	data() {
		return {
			status: 'starting',
			downProg: 0,
			downProgShow: false,
			downAnimation: false,
		};
	},
}
</script>
