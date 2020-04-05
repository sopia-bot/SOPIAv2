<template>
  <div class="media media-comment">
    <!-- <img class="avatar avatar-lg media-comment-avatar rounded-circle" :src="userImage"> -->
    <img 
      :style="{ backgroundImage: 'url(' + userImage + ')' }"
      class="avatar avatar-lg media-comment-avatar rounded-circle"
      style="width: 42px; height:42px; background-position: center; background-repeat: no-repeat; background-size: cover;">
    <div class="media-body">
      <div class="media-comment-text">
        <h6 class="h4 mt-0 d-flex align-items-center" :class="nameClass">
          <badge v-if="type === 'dj'" rounded class="bg-spoon mr-2" style="font-family: cursive;">DJ</badge>
          <badge v-else-if="type === 'manager'" rounded class="bg-info mr-2">{{ $t('manager') }}</badge>
          <span>{{userName}}</span>
        </h6>
        <p class="text-sm lh-160" v-html="text"></p>
        <div class="icon-actions" v-if="viewOption">
          <a href="#" class="like active">
            <i class="ni ni-like-2"></i>
            <span class="text-muted">{{likeCount}} likes</span>
          </a>
          <a href="#">
            <i class="ni ni-curved-next"></i>
            <span class="text-muted">{{shareCount}} shares</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'comment',
    props: {
      userImage: {
        type: String,
        default: 'img/theme/team-1.jpg'
      },
      userName: {
        type: String,
        default: 'Michael Lewis'
      },
      text: {
        type: String,
        default: 'Cras sit amet nibh libero nulla vel metus scelerisque ante sollicitudin. Cras purus odio vestibulum in vulputate viverra turpis.'
      },
      likeCount: {
        type: Number,
        default: 0
      },
      shareCount: {
        type: Number,
        default: 0
      },
      viewOption: {
        type: Boolean,
        default: false
      },
      nameClass: {
        type: String,
        default: ""
      },
      type: {
        type: String,
        default: "",
      }
    }
  }
</script>
<style>
</style>
