<template>
    <div class="container" style="height:100vh" v-if="!live">
		<div class="row align-items-center justify-content-center" style="height: 100%">
			<div class="col-lg-7 col-md-10">
				<!-- S:Card -->
				<div class="card bg-secondary border-0 mb-0">
					<div class="card-body px-lg-4">
						<div class="row ma-0">
							<div class="col col-12 px-4 text-center">
								<h1 class="ma-0">{{ $t('spoon.live.not-join') }}</h1>
							</div>
						</div>
					</div>
				</div>
				<!-- E:Card -->
			</div>
		</div>
    </div>

    <div v-else class="row ma-0">
        <div class="col col-12" style="padding: 2.5rem;">
            <div class="row ma-0">
                <div class="col col-12 col-md-6">
                    <LiveInfo/>
                </div>
                <div class="col col-12 col-md-6">
                    <LiveSave/>
                </div>
            </div>
            <div class="row ma-0">
                <div class="col col-12">
                    <LiveAdmins/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import LiveInfo from './Dashboards/LiveInfo';
import LiveAdmins from './Dashboards/Admins';
import LiveSave from './Dashboards/LiveSave';

export default {
    name: 'Dashboard',
    components: {
        LiveInfo,
        LiveAdmins,
        LiveSave,
    },
    mounted() {
        this.live = this.$s().$live() || null;
        console.log(this.live);
    },
    data() {
        return {
            live: null,
        };
    },
}
</script>
