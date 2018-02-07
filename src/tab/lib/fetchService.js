import Queue from 'promise-queue'
const queue = new Queue(40, Infinity)

// Used to debug. How much fetch mission queue. How much fetch mission pending.
setInterval(() => console.log(queue.getQueueLength(), queue.getPendingLength()), 3000)

export default async function fetchService (...args) {
  return new Promise((resolve, reject) => {
    let wrapper = null
    try {
      wrapper = async () => {
        try {
          const response = await fetch(...args)
          if (!response.ok) throw new Error('No ok.')
          return resolve(response)
        } catch (err) {
          console.error(err)
          return reject(err)
        }
      }
    } catch (err) {
      console.error(err)
      return reject(err)
    }
    queue.add(wrapper)
  })
}
