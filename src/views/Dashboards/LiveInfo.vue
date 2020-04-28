<template>
    <div class="card bg-white text-white border-0" style="height: 300px; background-size: contain; background-repeat: no-repeat; background-position: center;" :style="{ backgroundImage: 'url(' + live.img_url + ')' }">
        <div class="card-img-overlay d-flex align-items-center" style="background-color: rgba(0, 0, 0, 0.6);">
            <div>
                <h1 style="color: #b0e9ff">{{ live.title }} <span class="h5" style="color: #ffeca6;">{{ live.author.nickname }} (@{{ live.author.tag}})</span></h1>
                <p v-html="live.welcome_message.replace('\n', '<br>')"></p>
                <p class="mt-6">{{ new Date(live.created).toLocaleString() }} 에 시작한 라이브입니다.</p>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'LiveInfo',
    data() {
        return {
            live: this.$s().$live().info,
        };
    },
}
</script>