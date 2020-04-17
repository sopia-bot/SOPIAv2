<template>
	<div class="container" style="height:100vh">
		<div class="row align-items-center justify-content-center" style="height: 100%">
			<div class="col-lg-7 col-md-10">
				<!-- S:Card -->
				<div class="card bg-secondary border-0 mb-0">
                    <div class="card-header border-bottom-0 pb-0 px-lg-5 bg-transparent">
                        <div class="text-muted mt-2">
                            {{ $t('loading.status.'+status) }}
                        </div>
                    </div>
					<div class="card-body px-lg-4">
						<div class="row ma-0 mb-2">
							<div class="col col-12 px-4">
								<base-progress
									animated
									type="success"
									:height="5"
									:value="getProgress(step, stepLength)">
								</base-progress>
							</div>
						</div>
						<div v-if="downProgShow" class="row ma-0">
							<div class="col col-12 px-4">
								<base-progress
									:animated="downAnimation"
									type="success"
									:height="3"
									:value="downProg"></base-progress>
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
		getProgress(progress, finish) {
			return Math.round(progress / finish * 100);
		},
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

				this.stepLength += fl.length;
				for (let i=0;i<fl.length;i++) {
					const f = fl[i];
					const o = obj[f];
					const target = path.join(p, f);
					if ( o.ext ) {
						// file
						const file = `${target}.${o.ext}`;
						if ( fs.existsSync(file) ) {
							this.step++;
							continue;
						}

						this.status = "progress-down-file";
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

								this.downProg = this.getProgress(downloaded, contentLength);

								fs.appendFileSync(file, new Buffer(chunk.value));
							}
						} while ( !done );

						this.downAnimation = false;
						await sleep(300);
						this.status = "progress-down-complete";
						this.downProgShow = false;
						this.step++;
						await sleep(50);
					} else {
						// directory
						if ( !fs.existsSync(target) ) {
							fs.mkdirSync(target);
						}
						this.step++;
						await cfs(obj[f], target);
					}
				}
			};
			await cfs(files, this.up());

			this.status = "complete";
		},
		checkUserValid() {
			const cfg = this.$cfg('app');
			const licenseTag = cfg.get('license.id');
			const userTag = cfg.get('user.tag');
			return (userTag || licenseTag) ? userTag === licenseTag : false;
		},
	},
	async mounted() {
		if ( 1 ) {
		await sleep(3000);
		await this.checkUpdate();
		this.step++;
		await this.checkFiles();
		this.step++;
		await sleep(500);
		}
		
		this.$cfg('app').__loadConfigFile();
		this.$cfg('admins').__loadConfigFile();
		
		if ( this.checkUserValid() ) {
			this.$assign("/spoon/");
		} else {
			this.$assign("/login/");
		}
	},
	data() {
		return {
			status: 'starting',
			downProg: 0,
			downProgShow: false,
			downAnimation: false,
			step: 0,
			stepLength: 2,
		};
	},
}
</script>
