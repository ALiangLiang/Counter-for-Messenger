<template>
  <el-form :inline="true" class="thread-form-inline">
    <el-form-item :label="__('emoji') + __('colon')">
      <chooser
        type="emoji"
        @change="onChangeEmoji(thread, $event)"
        v-model="thread.emoji"></chooser>
    </el-form-item>
    <el-form-item :label="__('color') + __('colon')">
      <chooser
        type="color"
        @change="onChangeColor(thread, $event)"
        v-model="thread.color"></chooser>
    </el-form-item>
    <el-form-item :label="__('muteUntil') + __('colon')">
      <mute-until
        v-model="thread.muteUntil"
        @change="onMuteThread(thread, $event)" />
    </el-form-item>
    <el-form-item
      v-if="(thread.type === 'GROUP' || thread.type === 'USER') && thread.participants"
      :label="__('participants') + __('colon')">
      <div>
        <div
          v-for="(participant, i) in thread.participants"
          :key="i"
          class="participant-avatar">
          <el-tooltip
            v-if="participant && participant.user"
            :content="participant.user.name + ((participant.user.nickname) ? `(${participant.user.nickname})` : '')"
            placement="top-start">
            <avatar
              v-if="participant.user.avatar"
              :images="[{
                text: participant.user.name,
                src: participant.user.avatar
              }]"
              :allow-upload="false"
              @click.native="onClickParticipantAvatar(thread, participant.user)"/>
          </el-tooltip>
          <span
            v-if="!participant || !participant.user || !participant.user.avatar">
            {{ participant.user.name }}
          </span>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import Chooser from './Chooser.vue'
import MuteUntil from './MuteUntil.vue'
import Avatar from '../Avatar.vue'
const __ = chrome.i18n.getMessage

export default {
  name: 'DetailTemplate',

  props: ['thread'],

  components: { Chooser, MuteUntil, Avatar },

  methods: {
    onMuteThread (thread, muteSeconds) {
      this.$ga.event('Thread', 'set', 'mute', muteSeconds)
      return this.$emit('change', 'mute', thread, muteSeconds)
    },
    onChangeColor (thread, color) {
      this.$ga.event('Thread', 'set', 'color')
      return this.$emit('change', 'color', thread, color)
    },
    onChangeEmoji (thread, emoji) {
      this.$ga.event('Thread', 'set', 'emoji')
      return this.$emit('change', 'emoji', thread, emoji)
    },
    onClickParticipantAvatar (thread, { id: userId, nickname: oldNickname, name }) {
      return this.$prompt(__('editNicknameContent'), __('editNicknameTitle'), {
        confirmButtonText: __('ok'),
        cancelButtonText: __('cancel'),
        inputValue: oldNickname || '',
        inputPlaceholder: name || '',
        inputValidator: (value) => value.length <= 50,
        inputErrorMessage: 'Maximun length of nickname is 50.'
      })
        .then(({ value: newNickname }) =>
          this.$emit('change', 'nickname', thread, userId, newNickname))
        .catch(() => {})
    },
    onChangeNickname (thread, [nickname, otherUserId]) {
      this.$ga.event('Thread', 'set', 'nickname')
      return this.$emit('change', 'nickname', thread, otherUserId, nickname)
    }
  }
}
</script>

<style scoped>
.participant-avatar {
  display: inline-block;
  margin-right: 5px;
  cursor: pointer;
}
.thread-form-inline>.el-form-item {
  margin-bottom: 0;
}
.thread-form-inline>div:nth-child(n+2) {
  border-left: 1px solid #e6e6e6;
  padding-left: 12px;
}
</style>
