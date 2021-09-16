import { BroadcastChannel } from "broadcast-channel"
let channel

export const createChannel = ({channelName = ""}) => (store) => {
  channel = new BroadcastChannel("@lianulloa/vuex-module-maker/" + channelName)
  channel.onmessage = ({ type, payload }) => {
    switch (type) {
      case "dispatch":
        store.dispatch(payload)
        break
      default:
        break
    }
  }
}

export const getChannel = () => channel

export default channel