<template>
    <div class="card-group">
        <card
            style="max-width: 300px;"
            v-for="(admin, idx) in liveAdmins"
            :key="admin.tag + '-admin-card'">
            <img slot="image" class="card-img-top" :src="admin.profile_url">
            <h5 class="h4"> {{ admin.nickname }} <span class="h5">(@{{ admin.tag }})</span></h5>
            <p style="font-size: 10pt;"> {{ admin.description }} </p>
        </card>
    </div>
</template>
<script>
export default {
    name: 'LiveAdmins',
    mounted() {
        this.liveAdmins = [];
        this.liveAdmins.push(this.live.author);
        this.live.manager_ids.forEach(manager_id => {
            this.$s().user(manager_id)
                .then(user => {
                    this.liveAdmins.push(user);
                });
        });

        this.$s().$live().overon('admin-info', (live_info) => {
            this.live = live_info;
            const liveAdmins = JSON.parse(JSON.stringify(this.liveAdmins));
            liveAdmins.forEach((admin) => {
                if ( live_info.manager_ids.indexOf(admin.id) === -1 && live_info.author.id !== admin.id ) {
                    const idx = liveAdmins.findIndex(a => {a.id === admin.id});
                    liveAdmins.splice(idx, 1);
                }
            });

            this.liveAdmins = liveAdmins;
            
            live_info.manager_ids.forEach(manager_id => {
                const idx = this.liveAdmins.findIndex(admin => admin.id === manager_id);
                if ( idx === -1 ) {
                    this.$s().user(manager_id)
                        .then(user => {
                            this.liveAdmins.push(user);
                        })
                        .catch(this.$logger.error);
                }
            });
        });
    },
    data() {
        return {
            live: this.$s().$live().info,
            liveAdmins: [],
        };
    },
}
</script>