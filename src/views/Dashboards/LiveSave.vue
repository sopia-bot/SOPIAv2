<template>
    <card style="width: 100%;">
        <div slot="header" class="row ma-0 align-items-center justify-content-center mb-0">
            <div class="col col-8">
                <span class="ma-0 h2">{{ $t('dashboard.chat-save') }}</span>
            </div>
            <div class="col col-4 text-right">
                <base-button
                    v-if="buttonRender"
                    size="sm"
                    :type="isSaving ? 'danger' : 'primary'"
                    class="circle-button"
                    @click="isSaving ? stopSave() : startSave()">
                    <i v-if="isSaving" class="fas fa-stop"></i>
                    <i v-else class="fas fa-play"></i>
                </base-button>
            </div>
        </div>

        <div class="row ma-0 align-items-center justify-content-center">
            <div v-if="isSaving" class="col col-12 text-center">
                <p class="ma-0">{{ $t('dashboard.saving-log') }} [ {{ basename($s().$live().isSaveFile) }} ]</p>
            </div>
            <div class="col col-12 text-center">
                <p class="ma-0">{{ $t('dashboard.not-saving') }}</p>
            </div>
        </div>
    </card>
</template>
<script>
import { Select, Option } from 'element-ui';
import path from 'path';

export default {
    name: 'LiveSave',
    components: {
        [Select.name]: Select,
		[Option.name]: Option,
    },
    methods: {
        basename: path.basename,
        reloadButton() {
            this.buttonRender = false;
            this.$nextTick(() => {
                this.buttonRender = true;
            });
        },
        startSave() {
            this.isSaving = true;
            this.$s().$live().startSaveChat();
            this.reloadButton();
        },
        stopSave() {
            this.isSaving = false;
            this.$s().$live().stopSaveChat();
            this.reloadButton();
        },
    },
    data() {
        return {
            isSaving: this.$s().$live().isSaveChat,
            buttonRender: true,
        };
    },
}
</script>
<style scoped>
.circle-button {
    border-radius: 50%;
    width: 45px;
    height: 45px;
}
</style>