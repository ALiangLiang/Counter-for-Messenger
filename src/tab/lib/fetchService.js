import Queue from 'promise-queue'
const queue = new Queue(40, Infinity)
setInterval(() => console.log(queue.getQueueLength(), queue.getPendingLength()), 3000)
export default async function fetchService (...args) {
  return new Promise((resolve, reject) => {
    const wrapper = async () => {
      try {
        return resolve(await fetch(...args))
      } catch (err) {
        return reject(err)
      }
    }
    queue.add(wrapper)
  })
}
